import express from 'express';
import "reflect-metadata";
import spreadsheetsRouter from './routes/spreadsheets';

const app = express();
const port = 3001;

app.use(express.json());
app.use('/api/shubTest', spreadsheetsRouter);

export const startServer = () => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

export default app;