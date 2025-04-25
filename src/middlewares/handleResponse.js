const handleResponse = (req, res, next) => {
    const status = req.responseData.status || 200;
    const message = req.responseData.message || 'Success';
    const data = req.responseData.data || null;

    // Gửi response với status, message và data
    res.status(status).json({ status,message, data });
};

module.exports = handleResponse;