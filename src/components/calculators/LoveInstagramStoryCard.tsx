import { forwardRef } from "react";
import { Heart, Sparkles, Star, User } from "lucide-react";
import type { ZodiacCompatibilityResult } from "@/lib/zodiacCompatibility";

interface LoveInstagramStoryCardProps {
  name1: string;
  name2: string;
  photo1: string | null;
  photo2: string | null;
  percentage: number;
  nameMatchScore: number;
  numerologyScore: number;
  zodiacResult: ZodiacCompatibilityResult | null;
  compatibilityLevel: string;
  message: string;
}

export const LoveInstagramStoryCard = forwardRef<HTMLDivElement, LoveInstagramStoryCardProps>(
  ({ name1, name2, photo1, photo2, percentage, nameMatchScore, numerologyScore, zodiacResult, compatibilityLevel, message }, ref) => {
    const isHighCompatibility = percentage >= 90;
    
    return (
      <div
        ref={ref}
        data-instagram-story="true"
        className="relative overflow-hidden"
        style={{
          width: "1080px",
          height: "1920px",
          // Soft gradient background (dark pink / purple)
          background: "linear-gradient(160deg, #1a0a1f 0%, #2d1b3d 25%, #1f0a25 50%, #15061a 75%, #0d0510 100%)",
        }}
      >
        {/* Glow/Blur effect behind card - premium feel */}
        <div 
          className="absolute rounded-full blur-[120px] opacity-60"
          style={{
            width: "800px",
            height: "800px",
            left: "50%",
            top: "45%",
            transform: "translate(-50%, -50%)",
            background: isHighCompatibility 
              ? "radial-gradient(circle, #ec4899 0%, #f43f5e 40%, #a855f7 100%)"
              : "radial-gradient(circle, #ec4899 0%, #a855f7 100%)",
          }}
        />
        
        {/* Secondary glow */}
        <div 
          className="absolute rounded-full blur-[80px] opacity-40"
          style={{
            width: "500px",
            height: "500px",
            left: "50%",
            top: "35%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, #f472b6 0%, transparent 70%)",
          }}
        />

        {/* Decorative floating hearts */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {[...Array(20)].map((_, i) => (
            <Heart
              key={i}
              className="absolute text-pink-300"
              fill="currentColor"
              style={{
                width: `${30 + Math.random() * 50}px`,
                height: `${30 + Math.random() * 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: 0.3 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>

        {/* Main Content - Positioned in safe zone */}
        {/* Top safe zone: 250px, Bottom safe zone: 300px */}
        {/* Content area: 250px to 1620px (1370px available) */}
        <div 
          className="absolute left-0 right-0 flex flex-col items-center justify-center px-12"
          style={{
            top: "280px",
            bottom: "330px",
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Heart className="w-10 h-10 text-pink-400" fill="currentColor" />
              <span className="text-4xl font-bold text-white tracking-wider">Love Calculator</span>
              <Heart className="w-10 h-10 text-pink-400" fill="currentColor" />
            </div>
            {isHighCompatibility && (
              <div 
                className="inline-block px-8 py-3 rounded-full text-3xl font-black text-white"
                style={{
                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
                  boxShadow: "0 0 40px rgba(251, 191, 36, 0.5)",
                }}
              >
                ✨ PERFECT MATCH! ✨
              </div>
            )}
          </div>

          {/* Photos and Names */}
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="text-center">
              {photo1 ? (
                <img 
                  src={photo1} 
                  alt={name1} 
                  className="w-36 h-36 rounded-full object-cover mx-auto"
                  style={{
                    border: "6px solid rgba(255,255,255,0.4)",
                    boxShadow: "0 0 40px rgba(236, 72, 153, 0.5)",
                  }}
                />
              ) : (
                <div 
                  className="w-36 h-36 rounded-full flex items-center justify-center mx-auto"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
                    border: "4px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <User className="w-16 h-16 text-white/70" />
                </div>
              )}
              <div className="text-3xl font-bold text-white mt-4 drop-shadow-lg">{name1}</div>
              {zodiacResult && (
                <span className="text-4xl mt-2 block">{zodiacResult.sign1.symbol}</span>
              )}
            </div>
            
            <Heart 
              className="w-20 h-20 text-pink-400 mx-4" 
              fill="currentColor"
              style={{
                filter: "drop-shadow(0 0 20px rgba(236, 72, 153, 0.8))",
              }}
            />
            
            <div className="text-center">
              {photo2 ? (
                <img 
                  src={photo2} 
                  alt={name2} 
                  className="w-36 h-36 rounded-full object-cover mx-auto"
                  style={{
                    border: "6px solid rgba(255,255,255,0.4)",
                    boxShadow: "0 0 40px rgba(168, 85, 247, 0.5)",
                  }}
                />
              ) : (
                <div 
                  className="w-36 h-36 rounded-full flex items-center justify-center mx-auto"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
                    border: "4px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <User className="w-16 h-16 text-white/70" />
                </div>
              )}
              <div className="text-3xl font-bold text-white mt-4 drop-shadow-lg">{name2}</div>
              {zodiacResult && (
                <span className="text-4xl mt-2 block">{zodiacResult.sign2.symbol}</span>
              )}
            </div>
          </div>

          {/* Main Percentage Circle */}
          <div className="relative w-72 h-72 mb-10">
            {/* Outer glow */}
            <div 
              className="absolute inset-0 rounded-full blur-xl"
              style={{
                background: isHighCompatibility 
                  ? "linear-gradient(135deg, #ec4899 0%, #f43f5e 50%, #f97316 100%)"
                  : "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
                opacity: 0.4,
              }}
            />
            
            {/* Circle background */}
            <div 
              className="absolute inset-4 rounded-full"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)",
                border: "6px solid rgba(255,255,255,0.2)",
              }}
            />
            
            {/* SVG Progress */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle 
                cx="144" 
                cy="144" 
                r="120" 
                stroke="rgba(255,255,255,0.15)" 
                strokeWidth="16" 
                fill="none" 
              />
              <circle 
                cx="144" 
                cy="144" 
                r="120" 
                stroke="url(#storyGradient)" 
                strokeWidth="16" 
                fill="none" 
                strokeLinecap="round"
                strokeDasharray={754} 
                strokeDashoffset={754 - (754 * percentage) / 100} 
              />
              <defs>
                <linearGradient id="storyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor={isHighCompatibility ? "#f97316" : "#a855f7"} />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Percentage text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span 
                className="text-8xl font-black text-white"
                style={{
                  textShadow: "0 0 40px rgba(236, 72, 153, 0.8)",
                }}
              >
                {percentage}%
              </span>
              <span className="text-2xl font-semibold text-white/80 mt-2">{compatibilityLevel}</span>
            </div>
          </div>

          {/* Score breakdown */}
          <div className={`grid gap-6 w-full max-w-2xl mb-8 ${zodiacResult ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <div 
              className="rounded-2xl p-5 text-center"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-pink-300" />
              <div className="text-4xl font-bold text-white">{nameMatchScore}%</div>
              <div className="text-lg text-white/70 mt-1">Name Match</div>
            </div>
            <div 
              className="rounded-2xl p-5 text-center"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              <span className="text-3xl block mb-2">🔮</span>
              <div className="text-4xl font-bold text-white">{numerologyScore}%</div>
              <div className="text-lg text-white/70 mt-1">Numerology</div>
            </div>
            {zodiacResult && (
              <div 
                className="rounded-2xl p-5 text-center"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <Star className="w-8 h-8 mx-auto mb-2 text-amber-300" />
                <div className="text-4xl font-bold text-white">{zodiacResult.score}%</div>
                <div className="text-lg text-white/70 mt-1">Zodiac</div>
              </div>
            )}
          </div>

          {/* Message */}
          <div 
            className="text-center px-8 py-5 rounded-2xl max-w-2xl mb-8"
            style={{
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255,255,255,0.15)",
            }}
          >
            <p className="text-2xl font-medium text-white leading-relaxed">{message}</p>
          </div>

          {/* Footer */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 text-xl text-white/60 mb-3">
              <Heart className="w-5 h-5" fill="currentColor" />
              <span className="font-medium tracking-wide">mypdfs.in/love-calculator</span>
              <Heart className="w-5 h-5" fill="currentColor" />
            </div>
            <p className="text-sm text-white/40">For fun & entertainment only</p>
          </div>
        </div>
      </div>
    );
  }
);

LoveInstagramStoryCard.displayName = "LoveInstagramStoryCard";
