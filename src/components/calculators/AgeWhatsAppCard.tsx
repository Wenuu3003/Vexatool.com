import { forwardRef } from "react";
import { Cake, Clock, Calendar, Hash, Sparkles, User } from "lucide-react";
import type { AgeResult } from "./AgeResultDisplay";

interface AgeWhatsAppCardProps {
  result: AgeResult;
  birthDate: string;
  photo?: string | null;
  name?: string;
}

export const AgeWhatsAppCard = forwardRef<HTMLDivElement, AgeWhatsAppCardProps>(
  ({ result, birthDate, photo, name }, ref) => {
    const isBirthday = result.daysUntilBirthday === 0;
    
    return (
      <div
        ref={ref}
        data-whatsapp-card="true"
        className="relative overflow-hidden"
        style={{
          width: "1080px",
          height: "1080px",
          background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 30%, #8b5cf6 70%, #a855f7 100%)",
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
            background: isBirthday 
              ? "radial-gradient(circle, #fbbf24 0%, #3b82f6 60%, transparent 100%)"
              : "radial-gradient(circle, #60a5fa 0%, #a78bfa 100%)",
          }}
        />

        {/* Decorative sparkles */}
        <div className="absolute inset-0 overflow-hidden opacity-15">
          {[...Array(12)].map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-white"
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
          <div className="flex items-center gap-3 mb-4">
            <Cake className="w-8 h-8 text-white" />
            <span className="text-3xl font-bold text-white tracking-wide">Age Calculator</span>
            <Cake className="w-8 h-8 text-white" />
          </div>

          {isBirthday && (
            <div 
              className="px-6 py-2 rounded-full text-xl font-black text-white mb-4"
              style={{
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
                boxShadow: "0 0 30px rgba(251, 191, 36, 0.5)",
              }}
            >
              🎂 HAPPY BIRTHDAY! 🎂
            </div>
          )}

          {/* Birth Date */}
          <div 
            className="text-center px-6 py-3 rounded-xl mb-6"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.25)",
            }}
          >
            <span className="text-lg text-white/80">Born on </span>
            <span className="text-xl font-bold text-white">
              {new Date(birthDate).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric' 
              })}
            </span>
          </div>

          {/* User Name Display */}
          {name && (
            <div 
              className="text-3xl font-bold text-white mb-4 text-center"
              style={{ textShadow: "0 0 15px rgba(255,255,255,0.4)" }}
            >
              {name}
            </div>
          )}

          {/* Photo + Age Row */}
          <div className="flex items-center justify-center gap-6 mb-6">
            {/* Photo Circle (if photo exists) */}
            {photo && (
              <div className="relative w-36 h-36 flex-shrink-0">
                <div 
                  className="absolute inset-0 rounded-full blur-lg opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                  }}
                />
                <div 
                  className="absolute inset-2 rounded-full overflow-hidden"
                  style={{
                    border: "4px solid rgba(255,255,255,0.4)",
                    boxShadow: "0 0 20px rgba(255,255,255,0.3)",
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

            {/* Main Age Circle */}
            <div className={`relative ${photo ? 'w-40 h-40' : 'w-52 h-52'}`}>
              <div 
                className="absolute inset-0 rounded-full blur-xl opacity-50"
                style={{
                  background: isBirthday 
                    ? "linear-gradient(135deg, #fbbf24 0%, #3b82f6 100%)"
                    : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                }}
              />
              
              <div 
                className="absolute inset-3 rounded-full flex flex-col items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  border: "5px solid rgba(255,255,255,0.3)",
                }}
              >
                <span 
                  className={`${photo ? 'text-5xl' : 'text-7xl'} font-black text-white`}
                  style={{ textShadow: "0 0 30px rgba(255,255,255,0.5)" }}
                >
                  {result.years}
                </span>
                <span className={`${photo ? 'text-base' : 'text-xl'} font-semibold text-white/90`}>Years Old</span>
              </div>
            </div>
          </div>

          {/* Age breakdown */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-xl mb-6">
            <div 
              className="rounded-xl p-4 text-center"
              style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              <Calendar className="w-6 h-6 mx-auto mb-1 text-white" />
              <div className="text-3xl font-bold text-white">{result.years}</div>
              <div className="text-sm text-white/80">Years</div>
            </div>
            <div 
              className="rounded-xl p-4 text-center"
              style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              <Clock className="w-6 h-6 mx-auto mb-1 text-white" />
              <div className="text-3xl font-bold text-white">{result.months}</div>
              <div className="text-sm text-white/80">Months</div>
            </div>
            <div 
              className="rounded-xl p-4 text-center"
              style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
                border: "2px solid rgba(255,255,255,0.3)",
              }}
            >
              <Hash className="w-6 h-6 mx-auto mb-1 text-white" />
              <div className="text-3xl font-bold text-white">{result.days}</div>
              <div className="text-sm text-white/80">Days</div>
            </div>
          </div>

          {/* Total stats row */}
          <div className="flex gap-4 mb-6 text-center">
            <div className="px-4 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="text-xl font-bold text-cyan-200">{result.totalDays.toLocaleString()}</div>
              <div className="text-xs text-white/60">Days Lived</div>
            </div>
            <div className="px-4 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="text-xl font-bold text-violet-200">{result.totalWeeks.toLocaleString()}</div>
              <div className="text-xs text-white/60">Weeks</div>
            </div>
            <div className="px-4 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="text-xl font-bold text-fuchsia-200">{result.totalHours.toLocaleString()}</div>
              <div className="text-xs text-white/60">Hours</div>
            </div>
          </div>

          {/* Next Birthday */}
          {!isBirthday && (
            <div 
              className="flex items-center gap-3 px-6 py-3 rounded-xl mb-4"
              style={{
                background: "rgba(251, 191, 36, 0.2)",
                border: "2px solid rgba(251, 191, 36, 0.4)",
              }}
            >
              <Cake className="w-6 h-6 text-amber-300" />
              <span className="text-xl text-white">
                <span className="font-bold text-amber-300">{result.daysUntilBirthday}</span> days until next birthday! 🎉
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-lg text-white/80">
              <Cake className="w-4 h-4" />
              <span className="font-medium">mypdfs.in/love-calculator</span>
              <Cake className="w-4 h-4" />
            </div>
            <p className="text-xs text-white/50 mt-1">For fun & entertainment only</p>
          </div>
        </div>
      </div>
    );
  }
);

AgeWhatsAppCard.displayName = "AgeWhatsAppCard";
