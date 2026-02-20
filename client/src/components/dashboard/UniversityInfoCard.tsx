import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, MapPin, Sparkles, Copy, Check, Flame, Clock, Share2, MessageCircle, BookOpen } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface Story {
  title: string;
  content: string;
  emoji: string;
}

interface University {
  id: string;
  name: string;
  shortName: string;
  program: string;
  tuition: string;
  location: string;
  deadline: string;
  gradient: string;
  badgeColor: string;
  tagline: string;
  stories: Story[];
  hashtags: string[];
}

const universities: University[] = [
  {
    id: "sdnu",
    name: "Shandong Normal University",
    shortName: "SDNU",
    program: "Chinese Language",
    tuition: "6,000 RMB/semester",
    location: "Jinan, Shandong",
    deadline: "30th December",
    gradient: "from-emerald-500 to-teal-600",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    tagline: "Learn Chinese. Live Affordable. Study Smart.",
    hashtags: ["#StudyInChina", "#LearnChinese", "#SDNU", "#Foorsa"],
    stories: [
      {
        title: "The Best Deal in China",
        emoji: "deal",
        content: "Imagine paying just 6,000 RMB for a whole semester - and that includes your room! That's about $850 for tuition AND accommodation. You won't find this deal anywhere else in China. It's like getting a 2-for-1 special on your education."
      },
            {
        title: "The City of 72 Springs",
        emoji: "city",
        content: "Jinan isn't just any city - it's called the 'City of Springs' because it has 72 natural springs! The cost of living is super low compared to Beijing or Shanghai, but you're still connected to both by high-speed train. Best of both worlds."
      },
      {
        title: "Your Gateway to China",
        emoji: "gateway",
        content: "Learning Chinese here isn't just about passing exams. Small classes mean teachers actually know your name. Cultural trips show you the real China. And when you graduate? You'll speak the language that 1.4 billion people use. That's your ticket to any job in China."
      },
      {
        title: "Package Deal Magic",
        emoji: "package",
        content: "SDNU offers the ultimate package: tuition, accommodation, and sometimes even meals - all bundled together at a price that won't empty your wallet. It's the smart way to study abroad without the financial stress."
      },
            {
        title: "Jinan: The Hidden Gem",
        emoji: "gem",
        content: "Forget crowded Beijing and expensive Shanghai. Jinan is where the real China lives. Street food costs almost nothing, apartments are affordable, and you'll actually make Chinese friends because there aren't thousands of foreigners everywhere."
      },
      {
        title: "High-Speed Rail Hub",
        emoji: "train",
        content: "From Jinan, you're connected to all of China by high-speed rail. Beijing? 1.5 hours. Shanghai? 3 hours. Weekend trips become easy adventures. See more of China than students stuck in one city ever will."
      },
      {
        title: "Double Room Living",
        emoji: "room",
        content: "Your accommodation includes a comfortable double room right on campus. No commuting, no expensive rent, no landlord problems. Just roll out of bed and walk to class. Student life made simple."
      },
      {
        title: "Semester or Full Year",
        emoji: "calendar",
        content: "Not sure about committing to a full year? SDNU lets you choose: one semester or a full year. Test the waters first, then decide. Flexibility that fits your life plans."
      },
      {
        title: "Total Chinese Immersion",
        emoji: "immerse",
        content: "Living in Jinan means daily immersion in Chinese culture and language. From ordering street food to bargaining at markets, every day is a learning experience. Your Chinese will improve faster than in any classroom."
      },
      {
        title: "Teacher Attention",
        emoji: "teacher",
        content: "With small class sizes, your teachers actually know your name. Struggling with tones? They'll notice and help. Need extra practice? They're there for you. This personal attention is priceless for language learning."
      },
      {
        title: "Career Head Start",
        emoji: "career",
        content: "Chinese language skills are gold in today's job market. Companies everywhere need people who can work with China. Your SDNU experience becomes the competitive edge that opens doors others can't even see."
      },
      {
        title: "Language Proficiency",
        emoji: "speak",
        content: "SDNU's language program is designed to take you from beginner to conversational fast. Real-world practice, native teachers, and constant exposure mean you'll actually speak Chinese, not just read it from a book."
      },
      {
        title: "Cultural Heritage",
        emoji: "culture",
        content: "Shandong is the birthplace of Confucius. Mount Tai, one of China's most sacred mountains, is nearby. You're not just studying in China - you're living in the heart of Chinese civilization."
      },
      {
        title: "Low Cost Living",
        emoji: "money",
        content: "Your money goes further in Jinan. A full meal for 15 RMB ($2), taxi rides for pocket change, entertainment at student prices. Save money while getting a world-class experience."
      },
      {
        title: "Campus Life",
        emoji: "campus",
        content: "SDNU has a vibrant campus with sports facilities, student clubs, and cultural activities. Join the calligraphy club, play basketball with locals, or practice tai chi in the morning. Become part of the community."
      },
      {
        title: "Safe and Welcoming",
        emoji: "safe",
        content: "Jinan is one of China's safest cities. Low crime, friendly locals, and a welcoming attitude toward international students. Your family can relax knowing you're in good hands."
      },
      {
        title: "Four Seasons Beauty",
        emoji: "seasons",
        content: "Experience all four seasons in Jinan. Spring cherry blossoms, summer by the springs, autumn foliage, and magical winters. Each season brings new experiences and photo opportunities."
      },
      {
        title: "Your China Story Starts Here",
        emoji: "story",
        content: "Every success story needs a beginning. SDNU is where thousands of students started their China journey. Affordable, supportive, and rich in opportunity. Your story is waiting to be written."
      },
      {
        title: "Street Food Paradise",
        emoji: "food",
        content: "Jinan's street food scene is legendary. Dumplings, noodles, skewers - all for just a few yuan. Your taste buds will explore China while your wallet stays happy. Eating well here costs almost nothing."
      },
      {
        title: "Ancient Meets Modern",
        emoji: "blend",
        content: "Jinan perfectly blends ancient Chinese culture with modern convenience. Visit thousand-year-old temples, then grab coffee at a trendy cafe. Experience the best of both worlds every single day."
      },
      {
        title: "Small Class Advantage",
        emoji: "class",
        content: "Forget being just a number. SDNU keeps classes small so teachers can focus on YOU. Questions get answered, mistakes get corrected, and your Chinese improves faster than anywhere else."
      },
      {
        title: "Free Cultural Activities",
        emoji: "activities",
        content: "SDNU organizes free cultural trips, Chinese calligraphy classes, and traditional music sessions. Learn Chinese culture firsthand without spending extra money. Education beyond the classroom."
      },
      {
        title: "Safe Night Walks",
        emoji: "night",
        content: "Jinan is so safe you can walk anywhere at midnight. No stress, no worries. Focus on your studies knowing you're in one of China's most peaceful cities."
      },
      {
        title: "Dorm Life Done Right",
        emoji: "dorm",
        content: "Your dorm isn't just a room - it's home. Common areas for making friends, study spaces for focus, and everything you need steps from your bed. University life simplified."
      },
      {
        title: "Weekend Temple Trips",
        emoji: "temple",
        content: "Ancient Buddhist temples dot the hills around Jinan. Weekend hikes lead to stunning views and peaceful meditation spots. Connect with China's spiritual heritage."
      },
      {
        title: "Language Exchange Partners",
        emoji: "exchange",
        content: "Chinese students at SDNU want to practice English with you. Language exchange means free tutoring, new friends, and Chinese skills that textbooks can't teach."
      },
      {
        title: "Baotu Spring Magic",
        emoji: "spring",
        content: "Baotu Spring has flowed for over 2,700 years. Watch water bubble up from the earth while practicing Chinese with locals. This is authentic China, right outside your classroom."
      },
      {
        title: "No Hidden Fees",
        emoji: "transparent",
        content: "What you see is what you pay. SDNU's all-inclusive pricing means no surprise fees, no extra charges. Budget with confidence and focus on learning."
      },
      {
        title: "Alumni Success Stories",
        emoji: "alumni",
        content: "SDNU graduates work across China and the world. The language skills you build here open doors to careers in business, translation, teaching, and beyond."
      },
      {
        title: "Chinese New Year Experience",
        emoji: "newyear",
        content: "Experience Chinese New Year like a local. Fireworks, red lanterns, family dinners, and cultural traditions. Memories that last a lifetime, right from your first year."
      },
      {
        title: "Mobile Payment Easy",
        emoji: "mobile",
        content: "Learn to use WeChat Pay and Alipay - the cashless lifestyle. By month two, you'll pay for everything with your phone like a true local."
      },
      {
        title: "Affordable Gym Access",
        emoji: "fitness",
        content: "Campus sports facilities are free or nearly free. Stay fit, join basketball games, or try tai chi. Healthy body, healthy mind - all included in your student life."
      },
      {
        title: "Study Break Adventures",
        emoji: "break",
        content: "Between semesters, explore China by high-speed rail. Visit the Great Wall, see pandas in Chengdu, or relax on Hainan's beaches. Your adventure base is perfectly located."
      },
      {
        title: "Chinese Tea Culture",
        emoji: "tea",
        content: "Shandong has deep tea culture traditions. Learn to appreciate Chinese tea, visit tea houses, and make friends over steaming cups. A skill for life."
      },
      {
        title: "Practical Chinese Skills",
        emoji: "practical",
        content: "SDNU focuses on Chinese you'll actually use. Order food, negotiate prices, make friends - not just pass exams. Real-world language skills from day one."
      },
      {
        title: "Student Support Services",
        emoji: "support",
        content: "Feeling lost? SDNU's international student office helps with everything from visa issues to finding a doctor. You're never alone in navigating Chinese life."
      },
      {
        title: "Build Your Network",
        emoji: "network",
        content: "Classmates from all over the world become lifelong friends. The international community at SDNU creates connections that span continents. Your global network starts here."
      }
    ]
  },
  {
    id: "upc",
    name: "China University of Petroleum (East China)",
    shortName: "UPC",
    program: "Engineering & Sciences",
    tuition: "5,000 RMB/semester",
    location: "Qingdao, Shandong",
    deadline: "10th January",
    gradient: "from-accent to-accent/80",
    badgeColor: "bg-accent/10 text-accent dark:text-accent",
    tagline: "Where Future Energy Leaders Are Made",
    hashtags: ["#UPC", "#Engineering", "#StudyInChina", "#Foorsa"],
    stories: [
      {
        title: "Double First-Class Status",
        emoji: "trophy",
        content: "UPC isn't just any university - it has 'Double First-Class' status, which means the Chinese government officially recognizes it as world-class. Only the best universities get this title. It's like having a gold stamp on your degree."
      },
      {
        title: "Companies Fighting for Graduates",
        emoji: "company",
        content: "Sinopec, CNPC, Schlumberger, Haier - these giants don't just hire from UPC, they come to campus looking for students. Imagine getting job offers before you even graduate. That's the UPC advantage. 43 National Science Awards prove this university means business."
      },
      {
        title: "Beach Life + World-Class Education",
        emoji: "beach",
        content: "Study in Qingdao, a stunning coastal city with beautiful beaches and perfect weather. It hosted the 2008 Olympic Sailing events. You get to live in paradise while earning a degree that opens doors worldwide."
      },
      {
        title: "Top 1% in Engineering",
        emoji: "rank",
        content: "Here's a number that matters: UPC's engineering program is in the top 1% globally. When employers see this on your CV, they know you're serious. Alumni include Vice Premier Wu Yi - that's the kind of network you're joining."
      },
      {
        title: "Industry Partnerships",
        emoji: "partner",
        content: "UPC has direct partnerships with the world's biggest energy companies. Internships, research projects, job placements - they happen naturally because these companies are already on campus, already invested in students like you."
      },
      {
        title: "Qingdao: Coastal Paradise",
        emoji: "coastal",
        content: "Imagine studying with ocean views. Qingdao is famous for its German architecture, beautiful coastline, and the best beer in China. It's not just a city - it's a lifestyle upgrade."
      },
      {
        title: "43 National Science Awards",
        emoji: "awards",
        content: "When a university wins 43 National Science Awards, you know the research is world-class. Study here and you're surrounded by cutting-edge discoveries. Some students even contribute to award-winning projects."
      },
      {
        title: "Fortune 500 Recruitment",
        emoji: "fortune",
        content: "Fortune 500 companies don't waste time at average universities. They recruit at UPC because they know the graduates are exceptional. Your degree becomes a VIP pass to the best companies in the world."
      },
      {
        title: "Research Excellence",
        emoji: "research",
        content: "UPC's research facilities are among the best in China. State-of-the-art labs, international research collaborations, and professors who are leaders in their fields. This is where real science happens."
      },
      {
        title: "Internship Connections",
        emoji: "intern",
        content: "The university's industry connections mean internship opportunities you won't find elsewhere. Work with real engineers on real projects. Build your CV while you're still a student."
      },
      {
        title: "Olympic Sailing City",
        emoji: "sailing",
        content: "Qingdao hosted the 2008 Olympic Sailing events. The city still has that international, athletic spirit. Join water sports clubs, watch international competitions, or just enjoy the beautiful marina."
      },
      {
        title: "Perfect Climate",
        emoji: "climate",
        content: "Unlike scorching southern cities or freezing northern ones, Qingdao has the perfect climate. Mild winters, cool summers, and ocean breezes year-round. Study in comfort."
      },
      {
        title: "German Architecture District",
        emoji: "architecture",
        content: "Qingdao's old town features stunning German colonial architecture. Wander through European-style streets, photograph beautiful buildings, and enjoy a city that feels like two worlds in one."
      },
      {
        title: "Vice Premier Alumnus",
        emoji: "premier",
        content: "Former Vice Premier Wu Yi graduated from UPC. When alumni reach the highest levels of government, you know the network is powerful. Join a community of leaders."
      },
      {
        title: "Challenge Cup Champions",
        emoji: "champion",
        content: "UPC students regularly win the Challenge Cup - China's most prestigious student innovation competition. This isn't just about studying; it's about creating, innovating, and winning."
      },
      {
        title: "Global Engineering Rankings",
        emoji: "global",
        content: "In global engineering rankings, UPC consistently places among the elite. International recognition means your degree is valued not just in China, but worldwide."
      },
      {
        title: "Energy Sector Gateway",
        emoji: "energy",
        content: "As the world transitions to new energy, engineers are in massive demand. UPC positions you at the center of this transformation. Oil, gas, renewables - you'll understand it all."
      },
      {
        title: "Employability Champion",
        emoji: "employ",
        content: "UPC graduates have some of the highest employment rates in China. Companies literally compete to hire them. Your job search starts with offers, not applications."
      },
      {
        title: "Affordable Excellence",
        emoji: "value",
        content: "At 5,000 RMB per semester, UPC offers incredible value. Elite education, world-class facilities, industry connections - all at a price that makes sense. Smart investment, amazing returns."
      },
      {
        title: "Your Engineering Future",
        emoji: "future",
        content: "UPC doesn't just teach engineering - it launches careers. From day one, you're building toward a future where the best companies want you. Start your journey at one of China's finest."
      },
      {
        title: "Ocean Engineering Excellence",
        emoji: "ocean",
        content: "UPC leads China in ocean engineering research. Deep-sea drilling, offshore platforms, underwater technology - cutting-edge work that's shaping humanity's future in the oceans."
      },
      {
        title: "Tsingtao Beer Culture",
        emoji: "beer",
        content: "Qingdao is home to Tsingtao, China's most famous beer. Explore the brewery, enjoy the beer festival, and understand why this coastal city is legendary for its refreshments."
      },
      {
        title: "May Fourth Square",
        emoji: "square",
        content: "May Fourth Square is one of China's most iconic landmarks. The wind sculpture, the ocean views, the history - Qingdao's heart beats right outside your university."
      },
      {
        title: "Seafood Heaven",
        emoji: "seafood",
        content: "Fresh seafood at student prices. Crabs, shrimp, fish - straight from the ocean to your plate. Coastal living means eating like royalty without the royal budget."
      },
      {
        title: "Campus by the Sea",
        emoji: "sea",
        content: "UPC's Qingdao campus is near the ocean. Study with sea breezes, jog along the coast, watch sunrises over the water. Engineering education with a view."
      },
      {
        title: "Energy Industry Network",
        emoji: "industry",
        content: "The energy industry is global and well-paying. UPC connects you to companies across the world. Your network extends from China to Houston, Dubai, and beyond."
      },
      {
        title: "Renewable Energy Focus",
        emoji: "renewable",
        content: "As the world shifts to clean energy, UPC is leading the way. Solar, wind, hydrogen - study the technologies that will power tomorrow."
      },
      {
        title: "Student Research Opportunities",
        emoji: "researchstudent",
        content: "Undergraduates at UPC don't just learn - they research. Join professor-led projects, publish papers, and build a research portfolio before you even graduate."
      },
      {
        title: "Mountainside Campus",
        emoji: "mountain",
        content: "The campus backs onto Laoshan Mountain. Hiking trails, fresh air, and stunning views await. Exercise your mind and body in nature's classroom."
      },
      {
        title: "International Student Community",
        emoji: "community",
        content: "Students from over 100 countries study at UPC. Make friends across cultures, celebrate international festivals, and build a truly global perspective."
      },
      {
        title: "Double First-Class Labs",
        emoji: "labs",
        content: "UPC's labs have Double First-Class designation. State-of-the-art equipment, cutting-edge research, and hands-on learning that employers recognize."
      },
      {
        title: "Port City Advantages",
        emoji: "port",
        content: "Qingdao is a major port city. International trade, global connections, and economic dynamism create opportunities you won't find in inland cities."
      },
      {
        title: "Photography Paradise",
        emoji: "photo",
        content: "Red rooftops, blue sea, green mountains - Qingdao is a photographer's dream. Document your student life with stunning backdrops at every turn."
      },
      {
        title: "Mild Winter Advantage",
        emoji: "winter",
        content: "Qingdao's winters are mild compared to northern cities. No extreme cold, no snow chaos. Comfortable weather year-round keeps you focused on studies."
      },
      {
        title: "Graduate School Pipeline",
        emoji: "gradschool",
        content: "UPC graduates are highly sought for graduate programs worldwide. Your bachelor's here opens doors to master's and PhD programs at top universities."
      },
      {
        title: "Industry Certifications",
        emoji: "cert",
        content: "Some UPC courses lead to industry certifications. Graduate with not just a degree, but professional credentials that fast-track your career."
      },
      {
        title: "Coastal Running Routes",
        emoji: "running",
        content: "Oceanfront paths stretch for kilometers. Morning runs with sea views, evening jogs at sunset. Stay healthy while enjoying one of China's most beautiful coastlines."
      },
      {
        title: "Engineering Competitions",
        emoji: "compete",
        content: "UPC students excel in national and international engineering competitions. Build real projects, compete with the best, and add championship titles to your CV."
      },
      {
        title: "Career Services Excellence",
        emoji: "careerservices",
        content: "UPC's career center actively connects students with employers. Resume workshops, interview prep, and job fairs bring opportunities directly to campus."
      }
    ]
  },
  {
    id: "nuaa",
    name: "Nanjing University of Aeronautics and Astronautics",
    shortName: "NUAA",
    program: "Aerospace & Engineering",
    tuition: "Scholarship Available",
    location: "Nanjing, Jiangsu",
    deadline: "15th January",
    gradient: "from-blue-500 to-indigo-600",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    tagline: "Train with the Engineers Who Built China's Aircraft",
    hashtags: ["#NUAA", "#Aerospace", "#Scholarship", "#Foorsa"],
    stories: [
      {
        title: "Scholarships Available",
        emoji: "scholarship",
        content: "Yes, you read that right - NUAA offers scholarships for international students. This is your chance to study aerospace engineering without breaking the bank. Apply now before spots fill up."
      },
      {
        title: "They Built the C919",
        emoji: "plane",
        content: "You know China's first homegrown passenger jet, the C919? NUAA engineers helped design it. The Chief Designer Wu Guanghui? He's a NUAA alumnus. When you study here, you're learning from the people who literally make planes fly."
      },
      {
        title: "One of the 'Seven Sons'",
        emoji: "defense",
        content: "NUAA is one of the 'Seven Sons of National Defence' - universities handpicked by China to train the best engineers. Ranked #36 in all of China. This isn't just a degree; it's membership in an elite club."
      },
      {
        title: "From Drones to Space",
        emoji: "rocket",
        content: "DJI, Huawei, COMAC, Siemens - these companies recruit directly from NUAA. The university pioneered China's drone technology. Astronaut Wang Yaping is an alumna. Dream big here, and you might end up reaching the stars."
      },
      {
        title: "C919 Connection",
        emoji: "aircraft",
        content: "China's first homegrown passenger jet, the C919, has NUAA DNA all over it. Engineers, designers, project managers - so many came from this university. Study here and join the team that made history."
      },
      {
        title: "Seven Sons Elite",
        emoji: "elite",
        content: "Being one of the 'Seven Sons of National Defence' means NUAA is trusted with China's most important technology. This elite status opens doors that other degrees simply cannot."
      },
      {
        title: "Space Program Access",
        emoji: "space",
        content: "China's space program recruits heavily from NUAA. Satellites, rockets, space stations - NUAA graduates work on all of them. Your classmates today could be designing tomorrow's Mars mission."
      },
      {
        title: "DJI & Huawei Partners",
        emoji: "tech",
        content: "The world's biggest drone company (DJI) and China's tech giant (Huawei) both recruit from NUAA. These aren't just any companies - they're the future of technology, and they want NUAA graduates."
      },
      {
        title: "RoboMaster Champions",
        emoji: "robot",
        content: "NUAA students regularly dominate RoboMaster - China's most prestigious robotics competition. Building real robots, competing against the best, winning championships. This is hands-on engineering at its finest."
      },
      {
        title: "Nanjing: Ancient Capital",
        emoji: "capital",
        content: "Study in Nanjing, one of China's ancient capitals. History at every corner, world-class museums, beautiful parks. A city that inspires greatness in everyone who lives there."
      },
      {
        title: "UNESCO Heritage Sites",
        emoji: "heritage",
        content: "Nanjing is surrounded by UNESCO World Heritage sites. The Ming Tombs, the city walls, the Presidential Palace. Your weekends become cultural explorations through thousands of years of history."
      },
      {
        title: "Tech Hub Scene",
        emoji: "hub",
        content: "Nanjing is emerging as a major tech hub. Startups, incubators, and tech giants all have presence here. The energy is electric, and opportunities are everywhere for ambitious students."
      },
      {
        title: "Vibrant Student Life",
        emoji: "student",
        content: "With over 30,000 students, NUAA has incredible campus life. Clubs for every interest, sports teams, cultural events, and a community that welcomes international students with open arms."
      },
      {
        title: "Astronaut Alumna",
        emoji: "astronaut",
        content: "Astronaut Wang Yaping studied at NUAA. She's been to space twice. When you walk these halls, you're following in the footsteps of someone who literally reached the stars."
      },
      {
        title: "Drone Pioneers",
        emoji: "drone",
        content: "NUAA pioneered China's drone technology. What started as university research became a global industry. Study here and be part of the next technological revolution."
      },
      {
        title: "Aerospace Recruitment",
        emoji: "recruit",
        content: "Every major aerospace company in China recruits at NUAA. COMAC, AVIC, China Aerospace - they all want NUAA graduates. Your degree is a golden ticket to the sky."
      },
      {
        title: "Research Opportunities",
        emoji: "lab",
        content: "NUAA's research labs are among the best in China. Wind tunnels, simulation centers, propulsion labs - as a student, you get access to facilities that professionals elsewhere only dream about."
      },
      {
        title: "Chief Designer Alumnus",
        emoji: "chief",
        content: "Wu Guanghui, Chief Designer of the C919, is a NUAA alumnus. The people who design China's aircraft studied in these classrooms. You're next in line."
      },
      {
        title: "High-Speed Rail Access",
        emoji: "rail",
        content: "From Nanjing, you're connected to all of China by high-speed rail. Shanghai is 1 hour away, Beijing just 3 hours. Explore the country on weekends while studying at one of its best universities."
      },
      {
        title: "Launch Your Aerospace Career",
        emoji: "launch",
        content: "NUAA is where aerospace dreams become reality. From the first day, you're training for a career in the skies. The future of flight is built here. Be part of it."
      },
      {
        title: "Nanjing Food Scene",
        emoji: "nanjingfood",
        content: "Nanjing cuisine is legendary. Duck, dumplings, and local specialties await around every corner. Your taste buds explore centuries of culinary tradition."
      },
      {
        title: "Purple Mountain Adventures",
        emoji: "purple",
        content: "Purple Mountain sits at Nanjing's edge. Hiking, historic sites, and panoramic views await. Weekend escapes into nature without leaving the city."
      },
      {
        title: "Ming Dynasty History",
        emoji: "ming",
        content: "Nanjing was China's capital during the Ming Dynasty. Walk where emperors walked, see ancient walls, and experience living history."
      },
      {
        title: "Student Innovation Hub",
        emoji: "innovation",
        content: "NUAA encourages student startups and innovation. Incubators, competitions, and funding help turn your ideas into reality."
      },
      {
        title: "Xuanwu Lake Campus",
        emoji: "lake",
        content: "Study near Xuanwu Lake, one of China's most beautiful urban lakes. Morning jogs, sunset walks, and peaceful study spots surround you."
      },
      {
        title: "Defense Industry Access",
        emoji: "defenseaccess",
        content: "As a 'Seven Sons' university, NUAA has deep ties to China's defense industry. Career paths most students can only dream about."
      },
      {
        title: "Simulation Centers",
        emoji: "simulation",
        content: "Fly planes before you design them. NUAA's flight simulators let you experience aerospace engineering firsthand. Theory becomes reality."
      },
      {
        title: "Materials Science Edge",
        emoji: "materials",
        content: "Advanced materials are key to aerospace. NUAA's materials science research creates the alloys and composites that make flight possible."
      },
      {
        title: "Confucius Temple Quarter",
        emoji: "confucius",
        content: "The Confucius Temple area offers nightlife, shopping, and history. Traditional architecture meets modern entertainment."
      },
      {
        title: "Yangtze River Access",
        emoji: "yangtze",
        content: "The Yangtze River flows through Nanjing. Boat cruises, riverside walks, and one of the world's great rivers at your doorstep."
      },
      {
        title: "AI in Aerospace",
        emoji: "aispace",
        content: "NUAA integrates AI into aerospace research. Smart drones, autonomous systems, and machine learning for flight. Future-focused education."
      },
      {
        title: "Alumni in Government",
        emoji: "government",
        content: "NUAA graduates hold positions throughout China's government and military. The alumni network reaches the highest levels of power."
      },
      {
        title: "Helicopter Engineering",
        emoji: "helicopter",
        content: "Beyond planes, NUAA excels in helicopter engineering. Rotorcraft design, military helicopters, civilian aircraft - all areas of expertise."
      },
      {
        title: "Nanjing Tech Scene",
        emoji: "nanjingtech",
        content: "Nanjing's tech industry is booming. Startups, tech giants, and innovation centers create opportunities for ambitious graduates."
      },
      {
        title: "Cross-Cultural Campus",
        emoji: "crosscultural",
        content: "Students from dozens of countries create a vibrant international community. Learn alongside future aerospace leaders from around the world."
      },
      {
        title: "Propulsion Research",
        emoji: "propulsion",
        content: "Jet engines, rocket motors, propulsion systems - NUAA researches how to make things fly faster. Cutting-edge work for ambitious students."
      },
      {
        title: "Academic Publishing",
        emoji: "publishing",
        content: "NUAA professors publish in top journals. Work alongside researchers whose papers shape the field. Academic excellence as standard."
      },
      {
        title: "Summer Palace Visits",
        emoji: "palace",
        content: "Historic palaces and gardens dot Nanjing. Explore imperial history between study sessions. Living in a city that made history."
      },
      {
        title: "Scholarship Opportunities",
        emoji: "scholarshipopps",
        content: "Multiple scholarship programs help fund your studies. Apply early and study aerospace at reduced cost or even free."
      }
    ]
  },
  {
    id: "bit",
    name: "Beijing Institute of Technology (Zhuhai Campus)",
    shortName: "BIT",
    program: "Technology & Sciences",
    tuition: "From 2,000 RMB/semester",
    location: "Zhuhai, Guangdong",
    deadline: "30th January",
    gradient: "from-purple-500 to-pink-600",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    tagline: "Ivy League Quality at Unbeatable Prices",
    hashtags: ["#BIT", "#Project985", "#IvyLeague", "#Foorsa"],
    stories: [
      {
        title: "China's Ivy League",
        emoji: "ivy",
        content: "Project 985 is China's Ivy League - only 39 universities in the entire country have this status. BIT is ranked #13 among them. When Chinese employers see '985' on your degree, every door opens. It's the golden ticket."
      },
      {
        title: "Cheapest Elite Education",
        emoji: "price",
        content: "Starting at just 2,000 RMB per semester - that's around $280! For a Project 985 university! This is the most affordable way to get an elite Chinese degree. The value here is absolutely unmatched."
      },
      {
        title: "Olympic Technology Pioneers",
        emoji: "olympic",
        content: "BIT engineers developed technology for both the 2008 and 2022 Olympics. They work on space docking systems. BYD, Baidu, Tencent recruit here. This university doesn't just teach theory - they create the future."
      },
      {
        title: "Gateway to Greater Bay Area",
        emoji: "gateway",
        content: "Zhuhai is a coastal paradise next to Hong Kong and Macau. Year-round tropical weather, beautiful beaches, and you're in China's biggest tech hub. Former Premier Li Peng is a BIT alumnus. Study here, and you're positioned for the best opportunities in Asia."
      },
      {
        title: "Project 985 Status",
        emoji: "985",
        content: "In China, '985' is magic. It's the elite tier of universities that everyone respects. BIT carries this prestige. Your degree doesn't just say what you studied - it says you're among the best."
      },
      {
        title: "Unbeatable Value",
        emoji: "value",
        content: "Where else can you get an Ivy League-equivalent education for 2,000 RMB a semester? Nowhere. BIT Zhuhai is the best-kept secret in Chinese higher education. Smart students choose value."
      },
      {
        title: "Olympics & Space Tech",
        emoji: "tech",
        content: "BIT developed technology for two Olympic Games. They work on space docking systems that connect satellites. This isn't theoretical education - it's building the technology that makes history."
      },
      {
        title: "BYD, Baidu, Tencent",
        emoji: "giants",
        content: "China's biggest tech companies - BYD (electric cars), Baidu (AI), Tencent (WeChat) - all recruit from BIT. These companies are shaping the future, and they want BIT graduates on their teams."
      },
      {
        title: "Space Docking Systems",
        emoji: "dock",
        content: "BIT engineers helped develop the technology that docks spacecraft in orbit. When China's astronauts connect to the space station, BIT technology makes it possible. Study here and work on projects that matter."
      },
      {
        title: "Zhuhai: Coastal Paradise",
        emoji: "paradise",
        content: "Forget cold winters and crowded cities. Zhuhai has tropical weather year-round, beautiful beaches, and a relaxed lifestyle. Study hard, then unwind in paradise. Life balance included."
      },
      {
        title: "Tropical Climate",
        emoji: "tropical",
        content: "While other students freeze in northern winters, you'll enjoy warm weather all year. Palm trees, ocean breezes, and sunshine - Zhuhai's climate makes every day feel like vacation."
      },
      {
        title: "Near Hong Kong & Macau",
        emoji: "nearby",
        content: "Zhuhai is a stone's throw from Hong Kong and Macau. Weekend trips to two of Asia's most exciting cities. International exposure, cultural diversity, and endless adventure - all within easy reach."
      },
      {
        title: "Premier Li Peng Alumnus",
        emoji: "premier",
        content: "Former Premier Li Peng graduated from BIT. When national leaders come from your university, you know the network is powerful. Join an alumni family that includes the highest levels of government."
      },
      {
        title: "Autonomous Driving Research",
        emoji: "autonomous",
        content: "BIT is at the forefront of autonomous driving technology. Self-driving cars, AI systems, sensor technology - cutting-edge research is happening here. Be part of the transportation revolution."
      },
      {
        title: "Modern Campus",
        emoji: "modern",
        content: "The Zhuhai campus is state-of-the-art. Modern facilities, new buildings, advanced labs. Everything a student needs to succeed, in a beautiful coastal setting."
      },
      {
        title: "Elite Doors Opening",
        emoji: "doors",
        content: "A 985 degree opens doors that other qualifications cannot. Graduate programs, job applications, business partnerships - when they see BIT, they take you seriously. Invest in your future."
      },
      {
        title: "Tech Hub Location",
        emoji: "location",
        content: "The Greater Bay Area is China's tech powerhouse. Shenzhen, Guangzhou, Hong Kong - all nearby. Internships, job opportunities, and startup ecosystems are at your doorstep."
      },
      {
        title: "Beach Lifestyle",
        emoji: "beach",
        content: "After exams, hit the beach. Zhuhai's coastline offers relaxation, water sports, and stunning sunsets. Student life here isn't just about books - it's about living well."
      },
      {
        title: "Island Hopping",
        emoji: "islands",
        content: "Zhuhai is surrounded by islands. Weekend trips to fishing villages, beaches, and natural beauty. Explore the South China Sea while studying at a world-class university."
      },
      {
        title: "Your Elite Future Starts Here",
        emoji: "start",
        content: "BIT Zhuhai offers what seems impossible: elite education at accessible prices, in a paradise location. Your future deserves the best. This is where it begins."
      },
      {
        title: "Cantonese Culture Immersion",
        emoji: "cantonese",
        content: "Experience Cantonese culture firsthand. Dim sum, Cantonese opera, and local traditions. A cultural education alongside your academic one."
      },
      {
        title: "AI Research Excellence",
        emoji: "airesearch",
        content: "BIT is a leader in AI research. Machine learning, computer vision, natural language processing - cutting-edge work that defines the future."
      },
      {
        title: "Cybersecurity Programs",
        emoji: "cyber",
        content: "Cybersecurity is essential in the digital age. BIT's programs prepare you for careers protecting critical systems and data."
      },
      {
        title: "Robotics Innovation",
        emoji: "robotics",
        content: "From industrial robots to service robots, BIT leads robotics research. Hands-on work with machines that will transform industries."
      },
      {
        title: "Smart City Technology",
        emoji: "smartcity",
        content: "BIT contributes to China's smart city initiatives. IoT, urban planning, data systems - technology that makes cities better."
      },
      {
        title: "Bicycle-Friendly Campus",
        emoji: "bicycle",
        content: "The campus is perfect for cycling. Green, flat, and bike-friendly. Get around easily while staying fit and reducing your carbon footprint."
      },
      {
        title: "Dim Sum Adventures",
        emoji: "dimsum",
        content: "Guangdong province is dim sum heaven. Steaming baskets of dumplings, buns, and pastries. Breakfast here is a culinary adventure."
      },
      {
        title: "Electronic City Shenzhen",
        emoji: "electronic",
        content: "Shenzhen, the world's electronics capital, is nearby. Visit the markets that supply the world's gadgets. See where technology is made."
      },
      {
        title: "Island Getaways",
        emoji: "getaway",
        content: "Islands dot the waters around Zhuhai. Weekend trips to pristine beaches, fishing villages, and natural reserves. Paradise is always close."
      },
      {
        title: "Electric Vehicle Hub",
        emoji: "ev",
        content: "BYD and other EV giants recruit from BIT. Electric vehicles are the future, and BIT students are building that future."
      },
      {
        title: "Gaming Industry Connections",
        emoji: "gaming",
        content: "Tencent, NetEase, and gaming studios recruit from BIT. If game development is your dream, the right connections are here."
      },
      {
        title: "Fitness Beach Culture",
        emoji: "fitnessbeach",
        content: "Beach volleyball, swimming, surfing - Zhuhai's beaches offer fitness and fun. Stay active in a beautiful tropical setting."
      },
      {
        title: "Photography Opportunities",
        emoji: "photoop",
        content: "Tropical sunsets, coastal views, modern architecture - every day brings new photo opportunities. Document your journey in paradise."
      },
      {
        title: "Macau Day Trips",
        emoji: "macau",
        content: "Macau is just across the border. World Heritage sites, Portuguese architecture, and unique culture await on easy day trips."
      },
      {
        title: "Affordable Student Living",
        emoji: "affordable",
        content: "Zhuhai is more affordable than Shenzhen or Guangzhou. Your money goes further while you're still connected to the Greater Bay Area."
      },
      {
        title: "Clean Air Quality",
        emoji: "cleanair",
        content: "Zhuhai consistently ranks among China's cleanest cities. Fresh ocean air, blue skies, and a healthy environment for studying."
      },
      {
        title: "Hong Kong Bridge Access",
        emoji: "bridge",
        content: "The Hong Kong-Zhuhai-Macau Bridge connects you to two world cities. Easy access to international finance and culture hubs."
      },
      {
        title: "Startup Ecosystem",
        emoji: "startup",
        content: "The Greater Bay Area is a startup hotbed. Venture capital, incubators, and entrepreneurial energy surround you. Launch your startup here."
      },
      {
        title: "Tropical Fruit Paradise",
        emoji: "fruit",
        content: "Mangoes, lychees, dragon fruit - tropical fruits are abundant and cheap. Fresh, delicious, and healthy eating every day."
      }
    ]
  }
];

function StoryCard({ story, university, onCopy }: { story: Story; university: University; onCopy: (text: string) => void }) {
  const [copied, setCopied] = useState(false);

  const getShareText = () => {
    return `${story.content}\n\n${university.hashtags.join(" ")}\n\nDeadline: ${university.deadline}`;
  };

  const handleCopy = () => {
    onCopy(getShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="bg-muted/50 rounded-lg p-4 space-y-3 hover-elevate cursor-pointer"
      onClick={handleCopy}
      data-testid={`story-card-${university.id}-${story.title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-sm">{story.title}</h4>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-7 w-7 flex-shrink-0"
          onClick={(e) => { e.stopPropagation(); handleCopy(); }}
          data-testid={`button-copy-story-${university.id}`}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{story.content}</p>
      <div className="flex items-center gap-2 pt-1">
        <Badge variant="secondary" className="text-[10px]">
          <Share2 className="h-2.5 w-2.5 mr-1" />
          Tap to copy
        </Badge>
      </div>
    </div>
  );
}

function UniversityPromoDialog({ university }: { university: University }) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Story copied - ready to share!",
    });
  };

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
      <DialogHeader className="flex-shrink-0">
        <DialogTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Know more about {university.shortName}
        </DialogTitle>
      </DialogHeader>
      
      <div className="flex-1 overflow-y-auto pr-2 min-h-0">
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
            <p className="font-medium">{university.tagline}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tap any story below to copy it. Share with your audience!
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 pb-2">
            {university.hashtags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">{tag}</Badge>
            ))}
          </div>

          <div className="space-y-3">
            {university.stories.map((story, index) => (
              <StoryCard 
                key={index} 
                story={story} 
                university={university}
                onCopy={copyToClipboard}
              />
            ))}
          </div>

          <div className="bg-destructive/5 rounded-lg p-4 border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-destructive" />
              <span className="font-semibold text-sm text-destructive">Deadline: {university.deadline}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Share these stories now - spots are filling fast!
            </p>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

function UniversityCard({ university }: { university: University }) {
  return (
    <Card className="overflow-visible border shadow-sm" data-testid={`card-university-${university.id}`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg">{university.shortName}</h3>
            <Badge variant="secondary" className="text-[10px] flex-shrink-0">
              {university.program}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{university.name}</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3 w-3" />
          <span>{university.location}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-muted/50 rounded-lg p-2.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tuition</p>
            <p className="text-sm font-semibold">{university.tuition}</p>
          </div>
          <div className="bg-destructive/5 rounded-lg p-2.5 border border-destructive/20">
            <p className="text-[10px] text-destructive uppercase tracking-wide flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              Deadline
            </p>
            <p className="text-sm font-semibold text-destructive">{university.deadline}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge variant="secondary" className="text-[10px]">
            <Flame className="h-2.5 w-2.5 mr-1" />
            Filling Fast
          </Badge>
          <Badge variant="secondary" className="text-[10px]">
            <Sparkles className="h-2.5 w-2.5 mr-1" />
            Exclusive Foorsa
          </Badge>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full" size="sm" data-testid={`button-stories-${university.id}`}>
              <BookOpen className="h-4 w-4 mr-2" />
              Know more
            </Button>
          </DialogTrigger>
          <UniversityPromoDialog university={university} />
        </Dialog>
      </CardContent>
    </Card>
  );
}

export function UniversityInfoCard() {
  const { t } = useLanguage();

  return (
    <div className="space-y-4" data-testid="section-universities">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">Exclusive Foorsa Offers: March Intake</h2>
          <p className="text-xs text-muted-foreground">Click any university to get stories you can share</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {universities.map((university) => (
          <UniversityCard key={university.id} university={university} />
        ))}
      </div>
    </div>
  );
}
