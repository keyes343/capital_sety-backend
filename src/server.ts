import app from './index';
import serverless from 'serverless-http';

app.listen(5000, () => {
    console.log('listening');
});

module.exports.handler = serverless(app);
