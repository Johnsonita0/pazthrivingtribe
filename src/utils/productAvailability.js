export const toDateTimeLocalValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

export const toIsoDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const getProductAvailability = (product = {}, now = Date.now()) => {
  const enabled = Boolean(product.release_enabled ?? product.releaseEnabled);
  if (!enabled) return { available: true, reason: "", message: "" };

  const currentTime = now instanceof Date ? now.getTime() : Number(now);
  const releaseAt = product.release_at ?? product.releaseAt;
  const releaseTime = releaseAt ? new Date(releaseAt).getTime() : NaN;
  if (Number.isFinite(releaseTime) && currentTime < releaseTime) {
    return {
      available: false,
      reason: "not-released",
      message: `Available on ${new Date(releaseTime).toLocaleString()}.`,
    };
  }

  const closeAt = product.close_at ?? product.closeAt;
  const closeTime = closeAt ? new Date(closeAt).getTime() : NaN;
  const allowAfterClose = Boolean(product.allow_after_close ?? product.allowAfterClose);
  if (Number.isFinite(closeTime) && currentTime >= closeTime && !allowAfterClose) {
    return {
      available: false,
      reason: "closed",
      message: "This product is no longer available.",
    };
  }

  return { available: true, reason: "", message: "" };
};