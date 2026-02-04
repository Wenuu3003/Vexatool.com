import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Check, X, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  showRequirements?: boolean;
  label?: string;
  placeholder?: string;
  id?: string;
}

const getPasswordRequirements = (password: string) => {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
  ];
};

export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  return errors;
};

/**
 * Password input component with optional requirements display and visibility toggle
 */
export const PasswordInput = ({
  value,
  onChange,
  showRequirements = false,
  label = "Password",
  placeholder = "Enter your password",
  id = "password",
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const requirements = useMemo(() => getPasswordRequirements(value), [value]);
  const isValid = useMemo(() => requirements.every(req => req.met), [requirements]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {showRequirements && value.length > 0 && (
        <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs font-medium text-muted-foreground">Password requirements:</p>
          <div className="grid grid-cols-2 gap-1">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs">
                {req.met ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <X className="w-3 h-3 text-muted-foreground" />
                )}
                <span className={req.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const usePasswordValidation = (password: string) => {
  const requirements = useMemo(() => getPasswordRequirements(password), [password]);
  const isValid = useMemo(() => requirements.every(req => req.met), [requirements]);
  const errors = useMemo(() => validatePassword(password), [password]);
  
  return { requirements, isValid, errors };
};
