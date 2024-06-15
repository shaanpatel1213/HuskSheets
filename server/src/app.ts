import express from 'express';
import "reflect-metadata";
import cors from 'cors';
import spreadsheetsRouter from './routes';

/**
 * Express application instance.
 * 
 * @author syadav7173
 */
const app = express();
const port = 3010;

app.use(cors());
app.use(express.json());
app.use('/api/shubTest', spreadsheetsRouter);

/**
 * Starts our server.
 *
 * @description Starts the Express server on the specified port.
 * @function
 * @returns {void}
 * @example startServer();
 * 
 * @author syadav7173
 */
export const startServer = () => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

export default app;