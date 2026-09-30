import { createHash, randomBytes } from 'crypto';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { encryptProductChatToken, getAdminEmails, normalizeEmail, sendProductChatEmail, validEmail } from './lib/product-chat.js';

const json = (res, status, payload) => {
  if (typeof res.status === 'function') return res.status(status).json(payload);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};
const tokenHash = (token) => createHash('sha256').update(token).digest('hex');

function parseBody(body) {
  if (typeof body !== 'string') return body || {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function validPhone(value) {
  const phone = String(value || '').trim();
  return phone.startsWith('+') && phone.length <= 20 && isValidPhoneNumber(phone);
}

async function findConversation(supabase, token) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const { data, error } = await supabase
    .from('product_chat_conversations')
    .select('id,product_id,product_title,vendor_id,vendor_name,vendor_email,assigned_to,customer_name,customer_email,customer_phone,status,access_token_hash,access_token_ciphertext,email_reply_token')
    .eq('access_token_hash', tokenHash(token))
    .maybeSingle();
  if (error) throw error;
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !process.env.RESEND_API_KEY) return json(res, 500, { error: 'Product chat is not configured.' });

  const body = parseBody(req.body);
  if (body.website) return json(res, 200, { ok: true });

  try {
    const supabase = createClient(url, key);

    if (body.action === 'start') {
      const customerName = String(body.name || '').trim().slice(0, 120);
      const customerEmail = normalizeEmail(body.email);
      const customerPhone = String(body.phone || '').trim();
      const message = String(body.message || '').trim().slice(0, 4000);
      const productId = String(body.productId || '').trim().slice(0, 120);
      if (!customerName || !validEmail.test(customerEmail) || !validPhone(customerPhone) || !message || !productId) {
        return json(res, 400, { error: 'Name, valid email, phone number, product, and message are required.' });
      }

      const { data: product, error: productError } = await supabase
        .from('store_products')
        .select('id,title,status,vendor_id,vendor_name')
        .eq('id', productId)
        .maybeSingle();
      if (productError) throw productError;
      if (!product || !(product.status === 'published' || (!product.vendor_id && product.status === 'approved'))) {
        return json(res, 404, { error: 'This product is not available for chat.' });
      }

      const { count: recentStarts, error: rateError } = await supabase
        .from('product_chat_conversations')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', productId)
        .eq('customer_email', customerEmail)
        .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());
      if (rateError) throw rateError;
      if (recentStarts >= 4) return json(res, 429, { error: 'Please wait before starting another chat about this product.' });

      const productTitle = product.title;
      let vendor = null;
      if (product.vendor_id) {
        const { data, error } = await supabase
          .from('vendor_profiles')
          .select('id,company_name,contact_email,status')
          .eq('id', product.vendor_id)
          .maybeSingle();
        if (error) throw error;
        if (data?.status === 'approved') vendor = data;
      }

      const admins = getAdminEmails();
      if (!admins.length && !vendor) return json(res, 500, { error: 'No product support recipient is configured.' });

      const token = randomBytes(32).toString('base64url');
      const now = new Date().toISOString();
      const conversation = {
        product_id: productId,
        product_title: productTitle,
        vendor_id: vendor?.id || null,
        vendor_name: vendor?.company_name || product.vendor_name || null,
        vendor_email: vendor && validEmail.test(normalizeEmail(vendor.contact_email)) ? normalizeEmail(vendor.contact_email) : null,
        assigned_to: vendor ? 'vendor' : 'admin',
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        access_token_hash: tokenHash(token),
        access_token_ciphertext: encryptProductChatToken(token),
        email_reply_token: randomBytes(24).toString('base64url'),
        status: 'open',
        last_message_at: now
      };
      const { data: createdConversation, error: conversationError } = await supabase
        .from('product_chat_conversations')
        .insert(conversation)
        .select('id,product_id,product_title,vendor_id,vendor_name,vendor_email,assigned_to,customer_name,customer_email,customer_phone,status,created_at')
        .single();
      if (conversationError) throw conversationError;

      const { error: messageError } = await supabase.from('product_chat_messages').insert({
        conversation_id: createdConversation.id,
        sender_role: 'customer',
        sender_name: customerName,
        sender_email: customerEmail,
        message
      });
      if (messageError) {
        await supabase.from('product_chat_conversations').delete().eq('id', createdConversation.id);
        throw messageError;
      }

      const vendorEmail = normalizeEmail(vendor?.contact_email);
      const recipients = [...new Set([...(validEmail.test(vendorEmail) ? [vendorEmail] : []), ...admins])];
      let emailSent = true;
      try {
        await sendProductChatEmail({
          to: recipients,
          subject: `Product question: ${productTitle}`,
          heading: `New product question from ${customerName}`,
          conversation: createdConversation,
          senderName: customerName,
          senderEmail: customerEmail,
          message,
          token,
          replyToken: conversation.email_reply_token
        });
        await sendProductChatEmail({
          to: [customerEmail],
          subject: `Your ${productTitle} conversation with PAZ`,
          heading: 'Your product question has been received.',
          conversation: createdConversation,
          senderName: 'PAZ Marketplace',
          senderEmail: process.env.RESEND_FROM_EMAIL || 'notifications@pazthrivingtribe.org',
          message: 'Use the secure link below to continue this conversation. You can also reply to this email when email replies are enabled.',
          token,
          replyToken: conversation.email_reply_token
        });
      } catch (error) {
        emailSent = false;
        console.error('Product chat notification failed:', error?.message || error);
      }

      return json(res, 201, { ok: true, token, emailSent, emailRepliesEnabled: Boolean(process.env.RESEND_INBOUND_DOMAIN), conversation: createdConversation, messages: [{ sender_role: 'customer', sender_name: customerName, message, created_at: now }] });
    }

    const conversation = await findConversation(supabase, body.token);
    if (!conversation) return json(res, 404, { error: 'This chat link is invalid or expired.' });

    if (body.action === 'read') {
      const { data: messages, error } = await supabase
        .from('product_chat_messages')
        .select('id,sender_role,sender_name,message,created_at')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const publicConversation = { ...conversation };
      delete publicConversation.access_token_hash;
      delete publicConversation.access_token_ciphertext;
      delete publicConversation.email_reply_token;
      return json(res, 200, { ok: true, emailRepliesEnabled: Boolean(process.env.RESEND_INBOUND_DOMAIN), conversation: publicConversation, messages: messages || [] });
    }

    if (body.action === 'send') {
      const message = String(body.message || '').trim().slice(0, 4000);
      if (!message) return json(res, 400, { error: 'Write a message before sending.' });
      const { data: latestCustomerMessage, error: latestMessageError } = await supabase
        .from('product_chat_messages')
        .select('created_at')
        .eq('conversation_id', conversation.id)
        .eq('sender_role', 'customer')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latestMessageError) throw latestMessageError;
      if (latestCustomerMessage && Date.now() - Date.parse(latestCustomerMessage.created_at) < 5000) {
        return json(res, 429, { error: 'Please wait a few seconds before sending another message.' });
      }
      const now = new Date().toISOString();
      const { data: savedMessage, error: messageError } = await supabase
        .from('product_chat_messages')
        .insert({ conversation_id: conversation.id, sender_role: 'customer', sender_name: conversation.customer_name, sender_email: conversation.customer_email, message })
        .select('id,sender_role,sender_name,message,created_at')
        .single();
      if (messageError) throw messageError;
      const { error: updateError } = await supabase
        .from('product_chat_conversations')
        .update({ status: 'open', updated_at: now, last_message_at: now })
        .eq('id', conversation.id);
      if (updateError) throw updateError;

      const admins = getAdminEmails();
      const recipients = [...new Set([...(conversation.assigned_to === 'vendor' && conversation.vendor_email ? [normalizeEmail(conversation.vendor_email)] : []), ...admins])];
      let emailSent = true;
      try {
        await sendProductChatEmail({
          to: recipients,
          subject: `New reply about ${conversation.product_title}`,
          heading: `New message from ${conversation.customer_name}`,
          conversation,
          senderName: conversation.customer_name,
          senderEmail: conversation.customer_email,
          message,
          token: body.token,
          replyToken: conversation.email_reply_token
        });
      } catch (error) {
        emailSent = false;
        console.error('Product chat reply notification failed:', error?.message || error);
      }
      return json(res, 200, { ok: true, emailSent, message: savedMessage });
    }

    return json(res, 400, { error: 'Unknown product chat action.' });
  } catch (error) {
    console.error('Product chat request failed:', error?.message || error);
    if (['42703', 'PGRST204'].includes(error?.code) && /access_token_ciphertext|email_reply_token/.test(error?.message || '')) {
      return json(res, 503, { error: 'Product chat database setup is incomplete. Run supabase-product-chat-setup.sql in Supabase SQL Editor, then retry.' });
    }
    return json(res, 500, { error: 'The product chat could not be processed.' });
  }
}