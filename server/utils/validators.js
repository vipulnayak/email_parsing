const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validateAttachment = (attachment) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  return allowedTypes.includes(attachment.mimeType);
};

module.exports = {
  validateEmail,
  validateAttachment
}; 