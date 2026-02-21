const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'process.env.DATABASE_URL';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const offers = [
  {
    title: 'SDNU',
    description: 'Shandong Normal University',
    category: 'Chinese Language',
    price: '6,000 RMB/semester',
    location: 'Jinan, Shandong',
    deadline: '30th December',
    sort_order: 1,
    stories: [
      { title: "The Best Deal in China", emoji: "deal", content: "Imagine paying just 6,000 RMB for a whole semester - and that includes your room! That's about $850 for tuition AND accommodation. You won't find this deal anywhere else in China." },
      { title: "The City of 72 Springs", emoji: "city", content: "Jinan isn't just any city - it's called the 'City of Springs' because it has 72 natural springs! The cost of living is super low compared to Beijing or Shanghai, but you're still connected to both by high-speed train." },
      { title: "Your Gateway to China", emoji: "gateway", content: "Learning Chinese here isn't just about passing exams. Small classes mean teachers actually know your name. Cultural trips show you the real China. And when you graduate? You'll speak the language that 1.4 billion people use." },
      { title: "Package Deal Magic", emoji: "package", content: "SDNU offers the ultimate package: tuition, accommodation, and sometimes even meals - all bundled together at a price that won't empty your wallet." },
      { title: "Jinan: The Hidden Gem", emoji: "gem", content: "Forget crowded Beijing and expensive Shanghai. Jinan is where the real China lives. Street food costs almost nothing, apartments are affordable, and you'll actually make Chinese friends." },
      { title: "High-Speed Rail Hub", emoji: "train", content: "From Jinan, you're connected to all of China by high-speed rail. Beijing? 1.5 hours. Shanghai? 3 hours. Weekend trips become easy adventures." },
      { title: "Total Chinese Immersion", emoji: "immerse", content: "Living in Jinan means daily immersion in Chinese culture and language. From ordering street food to bargaining at markets, every day is a learning experience." },
      { title: "Career Head Start", emoji: "career", content: "Chinese language skills are gold in today's job market. Companies everywhere need people who can work with China. Your SDNU experience becomes the competitive edge." },
      { title: "Cultural Heritage", emoji: "culture", content: "Shandong is the birthplace of Confucius. Mount Tai, one of China's most sacred mountains, is nearby. You're living in the heart of Chinese civilization." },
      { title: "Safe and Welcoming", emoji: "safe", content: "Jinan is one of China's safest cities. Low crime, friendly locals, and a welcoming attitude toward international students." },
    ],
  },
  {
    title: 'UPC',
    description: 'China University of Petroleum (East China)',
    category: 'Engineering & Sciences',
    price: '5,000 RMB/semester',
    location: 'Qingdao, Shandong',
    deadline: '10th January',
    sort_order: 2,
    stories: [
      { title: "Double First-Class Status", emoji: "trophy", content: "UPC has 'Double First-Class' status, which means the Chinese government officially recognizes it as world-class. Only the best universities get this title." },
      { title: "Companies Fighting for Graduates", emoji: "company", content: "Sinopec, CNPC, Schlumberger, Haier - these giants come to campus looking for students. 43 National Science Awards prove this university means business." },
      { title: "Beach Life + World-Class Education", emoji: "beach", content: "Study in Qingdao, a stunning coastal city with beautiful beaches and perfect weather. It hosted the 2008 Olympic Sailing events." },
      { title: "Top 1% in Engineering", emoji: "rank", content: "UPC's engineering program is in the top 1% globally. Alumni include Vice Premier Wu Yi - that's the kind of network you're joining." },
      { title: "Industry Partnerships", emoji: "partner", content: "UPC has direct partnerships with the world's biggest energy companies. Internships, research projects, job placements happen naturally." },
      { title: "Qingdao: Coastal Paradise", emoji: "coastal", content: "Imagine studying with ocean views. Qingdao is famous for its German architecture, beautiful coastline, and the best beer in China." },
      { title: "Fortune 500 Recruitment", emoji: "fortune", content: "Fortune 500 companies recruit at UPC because they know the graduates are exceptional. Your degree becomes a VIP pass." },
      { title: "Perfect Climate", emoji: "climate", content: "Unlike scorching southern cities or freezing northern ones, Qingdao has the perfect climate. Mild winters, cool summers, and ocean breezes year-round." },
      { title: "Affordable Excellence", emoji: "value", content: "At 5,000 RMB per semester, UPC offers incredible value. Elite education, world-class facilities, industry connections - all at a price that makes sense." },
      { title: "Your Engineering Future", emoji: "future", content: "UPC doesn't just teach engineering - it launches careers. From day one, you're building toward a future where the best companies want you." },
    ],
  },
  {
    title: 'NUAA',
    description: 'Nanjing University of Aeronautics and Astronautics',
    category: 'Aerospace & Engineering',
    price: 'Scholarship Available',
    location: 'Nanjing, Jiangsu',
    deadline: '15th January',
    sort_order: 3,
    stories: [
      { title: "Scholarships Available", emoji: "scholarship", content: "Yes, you read that right - NUAA offers scholarships for international students. Study aerospace engineering without breaking the bank." },
      { title: "They Built the C919", emoji: "plane", content: "China's first homegrown passenger jet, the C919? NUAA engineers helped design it. The Chief Designer Wu Guanghui is a NUAA alumnus." },
      { title: "One of the 'Seven Sons'", emoji: "defense", content: "NUAA is one of the 'Seven Sons of National Defence' - universities handpicked by China to train the best engineers. Ranked #36 in all of China." },
      { title: "From Drones to Space", emoji: "rocket", content: "DJI, Huawei, COMAC, Siemens recruit directly from NUAA. The university pioneered China's drone technology. Astronaut Wang Yaping is an alumna." },
      { title: "Space Program Access", emoji: "space", content: "China's space program recruits heavily from NUAA. Satellites, rockets, space stations - NUAA graduates work on all of them." },
      { title: "Nanjing: Ancient Capital", emoji: "capital", content: "Study in Nanjing, one of China's ancient capitals. History at every corner, world-class museums, beautiful parks." },
      { title: "RoboMaster Champions", emoji: "robot", content: "NUAA students regularly dominate RoboMaster - China's most prestigious robotics competition. Hands-on engineering at its finest." },
      { title: "Astronaut Alumna", emoji: "astronaut", content: "Astronaut Wang Yaping studied at NUAA. She's been to space twice. You're following in the footsteps of someone who reached the stars." },
      { title: "High-Speed Rail Access", emoji: "rail", content: "From Nanjing, Shanghai is 1 hour away, Beijing just 3 hours. Explore the country on weekends." },
      { title: "Launch Your Aerospace Career", emoji: "launch", content: "NUAA is where aerospace dreams become reality. The future of flight is built here. Be part of it." },
    ],
  },
  {
    title: 'BIT',
    description: 'Beijing Institute of Technology (Zhuhai Campus)',
    category: 'Technology & Sciences',
    price: 'From 2,000 RMB/semester',
    location: 'Zhuhai, Guangdong',
    deadline: '30th January',
    sort_order: 4,
    stories: [
      { title: "China's Ivy League", emoji: "ivy", content: "Project 985 is China's Ivy League - only 39 universities have this status. BIT is ranked #13 among them. The golden ticket." },
      { title: "Cheapest Elite Education", emoji: "price", content: "Starting at just 2,000 RMB per semester - that's around $280! For a Project 985 university! The value is absolutely unmatched." },
      { title: "Olympic Technology Pioneers", emoji: "olympic", content: "BIT engineers developed technology for both the 2008 and 2022 Olympics. They work on space docking systems. BYD, Baidu, Tencent recruit here." },
      { title: "Gateway to Greater Bay Area", emoji: "gateway", content: "Zhuhai is a coastal paradise next to Hong Kong and Macau. Year-round tropical weather, beautiful beaches, and China's biggest tech hub." },
      { title: "Project 985 Status", emoji: "985", content: "In China, '985' is magic. It's the elite tier of universities that everyone respects. BIT carries this prestige." },
      { title: "BYD, Baidu, Tencent", emoji: "giants", content: "China's biggest tech companies all recruit from BIT. These companies are shaping the future, and they want BIT graduates." },
      { title: "Zhuhai: Coastal Paradise", emoji: "paradise", content: "Forget cold winters and crowded cities. Zhuhai has tropical weather year-round, beautiful beaches, and a relaxed lifestyle." },
      { title: "Near Hong Kong & Macau", emoji: "nearby", content: "Weekend trips to two of Asia's most exciting cities. International exposure, cultural diversity, and endless adventure." },
      { title: "Modern Campus", emoji: "modern", content: "The Zhuhai campus is state-of-the-art. Modern facilities, new buildings, advanced labs in a beautiful coastal setting." },
      { title: "Your Elite Future Starts Here", emoji: "start", content: "BIT Zhuhai offers elite education at accessible prices, in a paradise location. Your future deserves the best." },
    ],
  },
];

async function seed() {
  try {
    // Add new columns if they don't exist
    await pool.query(`
      ALTER TABLE ref_offers ADD COLUMN IF NOT EXISTS location TEXT;
      ALTER TABLE ref_offers ADD COLUMN IF NOT EXISTS deadline TEXT;
      ALTER TABLE ref_offers ADD COLUMN IF NOT EXISTS stories JSONB;
    `);

    // Delete existing offers with these titles to avoid duplicates
    await pool.query(`DELETE FROM ref_offers WHERE title IN ('SDNU', 'UPC', 'NUAA', 'BIT')`);

    for (const offer of offers) {
      await pool.query(
        `INSERT INTO ref_offers (title, description, category, price, location, deadline, sort_order, stories, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
        [offer.title, offer.description, offer.category, offer.price, offer.location, offer.deadline, offer.sort_order, JSON.stringify(offer.stories)]
      );
      console.log(`Inserted: ${offer.title}`);
    }

    console.log('Done! All 4 offers seeded.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

seed();
