import express from 'express';
import "reflect-metadata";
import cors from 'cors';
import spreadsheetsRouter from './routes';

const app = express();
const port = 3010;

app.use(cors());
app.use(express.json());
app.use('/api/shubTest', spreadsheetsRouter);

export const startServer = () => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

export default app;