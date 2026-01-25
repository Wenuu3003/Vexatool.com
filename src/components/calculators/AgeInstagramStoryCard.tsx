import { forwardRef } from "react";
import { Cake, Clock, Calendar, Hash, Sparkles, User } from "lucide-react";
import type { AgeResult } from "./AgeResultDisplay";

interface AgeInstagramStoryCardProps {
  result: AgeResult;
  birthDate: string;
  photo?: string | null;
}

export const AgeInstagramStoryCard = forwardRef<HTMLDivElement, AgeInstagramStoryCardProps>(
  ({ result, birthDate, photo }, ref) => {
    const isBirthday = result.daysUntilBirthday === 0;
    
    return (
      <div
        ref={ref}
        data-instagram-story="true"
        className="relative overflow-hidden"
        style={{
          width: "1080px",
          height: "1920px",
          background: "linear-gradient(160deg, #0a1628 0%, #1e3a5f 25%, #0d2847 50%, #0a1628 75%, #061020 100%)",
        }}
      >
        {/* Glow effect */}
        <div 
          className="absolute rounded-full blur-[120px] opacity-50"
          style={{
            width: "800px",
            height: "800px",
            left: "50%",
            top: "45%",
            transform: "translate(-50%, -50%)",
            background: isBirthday 
              ? "radial-gradient(circle, #fbbf24 0%, #f59e0b 40%, #3b82f6 100%)"
              : "radial-gradient(circle, #3b82f6 0%, #6366f1 60%, #8b5cf6 100%)",
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
            background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)",
          }}
        />

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden opacity-15">
          {[...Array(15)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-blue-300"
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

        {/* Main Content - Safe zone positioning */}
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
              <Cake className="w-10 h-10 text-blue-400" />
              <span className="text-4xl font-bold text-white tracking-wider">Age Calculator</span>
              <Cake className="w-10 h-10 text-blue-400" />
            </div>
            {isBirthday && (
              <div 
                className="inline-block px-8 py-3 rounded-full text-3xl font-black text-white"
                style={{
                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
                  boxShadow: "0 0 40px rgba(251, 191, 36, 0.5)",
                }}
              >
                🎂 HAPPY BIRTHDAY! 🎂
              </div>
            )}
          </div>

          {/* Birth Date Display */}
          <div 
            className="text-center px-10 py-5 rounded-2xl mb-10"
            style={{
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          >
            <span className="text-2xl text-white/80">Born on</span>
            <div className="text-3xl font-bold text-white mt-2">
              {new Date(birthDate).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Photo Circle (if photo exists) */}
          {photo && (
            <div className="relative w-48 h-48 mb-8">
              <div 
                className="absolute inset-0 rounded-full blur-xl opacity-60"
                style={{
                  background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                }}
              />
              <div 
                className="absolute inset-2 rounded-full overflow-hidden"
                style={{
                  border: "6px solid rgba(255,255,255,0.4)",
                  boxShadow: "0 0 40px rgba(59, 130, 246, 0.5)",
                }}
              >
                <img
                  src={photo}
                  alt="User"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
            </div>
          )}

          {/* Main Age Display Circle */}
          <div className={`relative ${photo ? 'w-56 h-56' : 'w-80 h-80'} mb-10`}>
            {/* Outer glow */}
            <div 
              className="absolute inset-0 rounded-full blur-xl"
              style={{
                background: isBirthday 
                  ? "linear-gradient(135deg, #fbbf24 0%, #3b82f6 100%)"
                  : "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)",
                opacity: 0.4,
              }}
            />
            
            {/* Circle background */}
            <div 
              className="absolute inset-4 rounded-full flex flex-col items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)",
                border: "6px solid rgba(255,255,255,0.2)",
              }}
            >
              <span 
                className={`${photo ? 'text-7xl' : 'text-9xl'} font-black text-white`}
                style={{
                  textShadow: "0 0 40px rgba(59, 130, 246, 0.8)",
                }}
              >
                {result.years}
              </span>
              <span className={`${photo ? 'text-2xl' : 'text-3xl'} font-semibold text-white/80`}>Years Old</span>
            </div>
          </div>

          {/* Age breakdown */}
          <div className="grid grid-cols-3 gap-6 w-full max-w-2xl mb-10">
            <div 
              className="rounded-2xl p-5 text-center"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-300" />
              <div className="text-4xl font-bold text-white">{result.years}</div>
              <div className="text-lg text-white/70 mt-1">Years</div>
            </div>
            <div 
              className="rounded-2xl p-5 text-center"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              <Clock className="w-8 h-8 mx-auto mb-2 text-indigo-300" />
              <div className="text-4xl font-bold text-white">{result.months}</div>
              <div className="text-lg text-white/70 mt-1">Months</div>
            </div>
            <div 
              className="rounded-2xl p-5 text-center"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            >
              <Hash className="w-8 h-8 mx-auto mb-2 text-purple-300" />
              <div className="text-4xl font-bold text-white">{result.days}</div>
              <div className="text-lg text-white/70 mt-1">Days</div>
            </div>
          </div>

          {/* Total stats */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mb-8">
            <div 
              className="rounded-xl p-4 text-center"
              style={{
                background: "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              <div className="text-2xl font-bold text-cyan-300">{result.totalDays.toLocaleString()}</div>
              <div className="text-sm text-white/60">Total Days</div>
            </div>
            <div 
              className="rounded-xl p-4 text-center"
              style={{
                background: "rgba(99, 102, 241, 0.2)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
              }}
            >
              <div className="text-2xl font-bold text-violet-300">{result.totalWeeks.toLocaleString()}</div>
              <div className="text-sm text-white/60">Total Weeks</div>
            </div>
            <div 
              className="rounded-xl p-4 text-center"
              style={{
                background: "rgba(139, 92, 246, 0.2)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
              }}
            >
              <div className="text-2xl font-bold text-fuchsia-300">{result.totalHours.toLocaleString()}</div>
              <div className="text-sm text-white/60">Total Hours</div>
            </div>
          </div>

          {/* Next Birthday */}
          {!isBirthday && (
            <div 
              className="text-center px-10 py-5 rounded-2xl max-w-md mb-8"
              style={{
                background: "linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)",
                border: "2px solid rgba(251, 191, 36, 0.3)",
              }}
            >
              <Cake className="w-10 h-10 mx-auto mb-2 text-amber-400" />
              <div className="text-5xl font-bold text-amber-400">{result.daysUntilBirthday}</div>
              <div className="text-lg text-white/70 mt-1">Days until next birthday! 🎉</div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 text-xl text-white/60 mb-3">
              <Cake className="w-5 h-5" />
              <span className="font-medium tracking-wide">mypdfs.in/love-calculator</span>
              <Cake className="w-5 h-5" />
            </div>
            <p className="text-sm text-white/40">For fun & entertainment only</p>
          </div>
        </div>
      </div>
    );
  }
);

AgeInstagramStoryCard.displayName = "AgeInstagramStoryCard";
