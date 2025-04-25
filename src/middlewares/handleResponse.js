const handleResponse = (req, res, next) => {
    const oldJson = res.json;
    res.json = function(data) {
        // If response is already formatted, return as is
        if (data && data.status && data.timestamp) {
            return oldJson.call(this, data);
        }

        // Format the response
        const formattedResponse = {
            status: res.statusCode || 200,
            timestamp: new Date().toISOString(),
            message: data?.message || 'Success',
            data: data?.data || data || null
        };

        // Remove null/undefined values
        Object.keys(formattedResponse).forEach(key => 
            formattedResponse[key] === null && delete formattedResponse[key]
        );

        // Pretty print in development
        if (process.env.NODE_ENV === 'development') {
            return oldJson.call(this, JSON.stringify(formattedResponse, null, 2));
        }

        return oldJson.call(this, formattedResponse);
    };
    next();
};

module.exports = handleResponse;