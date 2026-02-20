const universities = [
  { name: "Beijing University", logo: "https://foorsa.ma/wp-content/uploads/2024/06/beijing-1.png" },
  { name: "Nanjing University", logo: "https://foorsa.ma/wp-content/uploads/2024/06/nanjing-1.png" },
  { name: "Shandong University", logo: "https://foorsa.ma/wp-content/uploads/2024/06/shandong-1.png" },
  { name: "Ningbo University", logo: "https://foorsa.ma/wp-content/uploads/2024/06/ningbo-1.png" },
  { name: "Linyi University", logo: "https://foorsa.ma/wp-content/uploads/2024/06/linyi-1.png" },
  { name: "CH University", logo: "https://foorsa.ma/wp-content/uploads/2024/06/ch-1.png" },
  { name: "Porto University", logo: "https://foorsa.ma/wp-content/uploads/2024/06/perto-1.png" },
  { name: "Sand University", logo: "https://foorsa.ma/wp-content/uploads/2024/06/sand-1.png" },
];

export function UniversitiesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Partner Universities
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We work with China's most prestigious universities to secure your future.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {universities.map((uni, index) => (
            <div 
              key={index}
              className="bg-background rounded-lg p-6 flex items-center justify-center hover-elevate transition-all duration-300 group"
              data-testid={`card-university-${index}`}
            >
              <img 
                src={uni.logo} 
                alt={uni.name}
                className="h-16 md:h-20 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
