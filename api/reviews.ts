import type { VercelRequest, VercelResponse } from '@vercel/node';

// Static reviews data for the landing page
const reviews = [
  { id: 1, name: "Ahmed M.", rating: 5, text: "Foorsa helped me get into my dream university in China. The process was smooth and the team was incredibly helpful!", date: "2024-11-15" },
  { id: 2, name: "Sara K.", rating: 5, text: "I was worried about studying abroad, but Foorsa made everything easy. From application to visa, they handled it all.", date: "2024-10-28" },
  { id: 3, name: "Omar B.", rating: 5, text: "The scholarship guidance was amazing. I got a full scholarship thanks to Foorsa's expert advice.", date: "2024-09-12" },
  { id: 4, name: "Fatima Z.", rating: 4, text: "Great service overall. The team is very responsive and knowledgeable about Chinese universities.", date: "2024-08-20" },
  { id: 5, name: "Youssef A.", rating: 5, text: "Best decision I ever made. Currently studying at a top university in Beijing, all thanks to Foorsa!", date: "2024-07-05" },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  return res.status(200).json(reviews);
}
