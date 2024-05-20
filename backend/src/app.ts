import express from 'express';
import spreadsheetsRouter from './routes/spreadsheets';

const app = express();
const port = 3000;

app.use(express.json());
app.use('/api/spreadsheets', spreadsheetsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
