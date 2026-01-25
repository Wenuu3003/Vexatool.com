import { forwardRef } from "react";
import { Heart, Sparkles, Star, User } from "lucide-react";
import type { ZodiacCompatibilityResult } from "@/lib/zodiacCompatibility";

interface LoveWhatsAppCardProps {
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

export const LoveWhatsAppCard = forwardRef<HTMLDivElement, LoveWhatsAppCardProps>(
  ({ name1, name2, photo1, photo2, percentage, nameMatchScore, numerologyScore, zodiacResult, compatibilityLevel, message }, ref) => {
    const isHighCompatibility = percentage >= 90;
    
    return (
      <div
        ref={ref}
        data-whatsapp-card="true"
        className="relative overflow-hidden"
        style={{
          width: "1080px",
          height: "1080px",
          background: "linear-gradient(135deg, #ec4899 0%, #f43f5e 30%, #a855f7 70%, #8b5cf6 100%)",
        }}
      >
        {/* Glow effect */}
        <div 
          className="absolute rounded-full blur-[100px] opacity-50"
          style={{
            width: "600px",
            height: "600px",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: isHighCompatibility 
              ? "radial-gradient(circle, #fbbf24 0%, #f43f5e 60%, transparent 100%)"
              : "radial-gradient(circle, #f472b6 0%, #a855f7 100%)",
          }}
        />

        {/* Decorative hearts */}
        <div className="absolute inset-0 overflow-hidden opacity-15">
          {[...Array(12)].map((_, i) => (
            <Heart
              key={i}
              className="absolute text-white"
              fill="currentColor"
              style={{
                width: `${40 + Math.random() * 60}px`,
                height: `${40 + Math.random() * 60}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: 0.3 + Math.random() * 0.5,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
            <span className="text-3xl font-bold text-white tracking-wide">Love Calculator</span>
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>

          {isHighCompatibility && (
            <div 
              className="px-6 py-2 rounded-full text-xl font-black text-white mb-6"
              style={{
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
                boxShadow: "0 0 30px rgba(251, 191, 36, 0.5)",
              }}
            >
              ✨ PERFECT MATCH! ✨
            </div>
          )}

          {/* Photos and Names Row */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              {photo1 ? (
                <img 
                  src={photo1} 
                  alt={name1} 
                  className="w-28 h-28 rounded-full object-cover mx-auto"
                  style={{
                    border: "5px solid rgba(255,255,255,0.5)",
                    boxShadow: "0 0 30px rgba(236, 72, 153, 0.6)",
                  }}
                />
              ) : (
                <div 
                  className="w-28 h-28 rounded-full flex items-center justify-center mx-auto"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "4px solid rgba(255,255,255,0.4)",
                  }}
                >
                  <User className="w-12 h-12 text-white/80" />
                </div>
              )}
              <div className="text-2xl font-bold text-white mt-3 drop-shadow-lg">{name1}</div>
              {zodiacResult && (
                <span className="text-3xl mt-1 block">{zodiacResult.sign1.symbol}</span>
              )}
            </div>
            
            <Heart 
              className="w-16 h-16 text-white mx-2" 
              fill="currentColor"
              style={{
                filter: "drop-shadow(0 0 15px rgba(255,255,255,0.8))",
              }}
            />
            
            <div className="text-center">
              {photo2 ? (
                <img 
                  src={photo2} 
                  alt={name2} 
                  className="w-28 h-28 rounded-full object-cover mx-auto"
                  style={{
                    border: "5px solid rgba(255,255,255,0.5)",
                    boxShadow: "0 0 30px rgba(168, 85, 247, 0.6)",
                  }}
                />
              ) : (
                <div 
                  className="w-28 h-28 rounded-full flex items-center justify-center mx-auto"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "4px solid rgba(255,255,255,0.4)",
                  }}
                >
                  <User className="w-12 h-12 text-white/80" />
                </div>
              )}
              <div className="text-2xl font-bold text-white mt-3 drop-shadow-lg">{name2}</div>
              {zodiacResult && (
                <span className="text-3xl mt-1 block">{zodiacResult.sign2.symbol}</span>
              )}
            </div>
          </div>

          {/* Percentage Circle */}
          <div className="relative w-56 h-56 mb-6">
            <div 
              className="absolute inset-0 rounded-full blur-xl opacity-50"
              style={{
                background: isHighCompatibility 
                  ? "linear-gradient(135deg, #fbbf24 0%, #f43f5e 100%)"
                  : "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
              }}
            />
            
            <div 
              className="absolute inset-3 rounded-full"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                border: "5px solid rgba(255,255,255,0.3)",
              }}
            />
            
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle 
                cx="112" 
                cy="112" 
                r="94" 
                stroke="rgba(255,255,255,0.2)" 
                strokeWidth="12" 
                fill="none" 
              />
              <circle 
                cx="112" 
                cy="112" 
                r="94" 
                stroke="url(#whatsappGradient)" 
                strokeWidth="12" 
                fill="none" 
                strokeLinecap="round"
                strokeDasharray={590} 
                strokeDashoffset={590 - (590 * percentage) / 100} 
              />
              <defs>
                <linearGradient id="whatsappGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#fdf2f8" />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span 
                className="text-6xl font-black text-white"
                style={{ textShadow: "0 0 30px rgba(255,255,255,0.5)" }}
              >
                {percentage}%
              </span>
              <span className="text-lg font-semibold text-white/90">{compatibilityLevel}</span>
            </div>
          </div>

          {/* Score breakdown */}
          <div className={`grid gap-4 w-full max-w-xl mb-6 ${zodiacResult ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <div 
              className="rounded-xl p-4 text-center"
              style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              <Sparkles className="w-6 h-6 mx-auto mb-1 text-white" />
              <div className="text-3xl font-bold text-white">{nameMatchScore}%</div>
              <div className="text-sm text-white/80">Name</div>
            </div>
            <div 
              className="rounded-xl p-4 text-center"
              style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              <span className="text-2xl block mb-1">🔮</span>
              <div className="text-3xl font-bold text-white">{numerologyScore}%</div>
              <div className="text-sm text-white/80">Numerology</div>
            </div>
            {zodiacResult && (
              <div 
                className="rounded-xl p-4 text-center"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(8px)",
                  border: "2px solid rgba(255,255,255,0.3)",
                }}
              >
                <Star className="w-6 h-6 mx-auto mb-1 text-amber-200" />
                <div className="text-3xl font-bold text-white">{zodiacResult.score}%</div>
                <div className="text-sm text-white/80">Zodiac</div>
              </div>
            )}
          </div>

          {/* Message */}
          <div 
            className="text-center px-6 py-4 rounded-xl max-w-lg mb-4"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          >
            <p className="text-xl font-medium text-white" style={{ lineHeight: "1.4" }}>{message}</p>
          </div>

          {/* Footer */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-lg text-white/80">
              <Heart className="w-4 h-4" fill="currentColor" />
              <span className="font-medium">mypdfs.in/love-calculator</span>
              <Heart className="w-4 h-4" fill="currentColor" />
            </div>
            <p className="text-xs text-white/50 mt-1">For fun & entertainment only</p>
          </div>
        </div>
      </div>
    );
  }
);

LoveWhatsAppCard.displayName = "LoveWhatsAppCard";
