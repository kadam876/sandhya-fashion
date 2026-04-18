/**
 * Password strength indicator + rules checklist.
 * Rules: min 8 chars, uppercase, lowercase, digit, special char.
 */

const rules = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number',           test: (p) => /\d/.test(p) },
  { label: 'One special character (@$!%*?&_#)', test: (p) => /[@$!%*?&_#]/.test(p) },
];

export const validatePassword = (password) => {
  const failed = rules.filter((r) => !r.test(password));
  return failed.length === 0 ? null : failed[0].label;
};

export const isPasswordValid = (password) => rules.every((r) => r.test(password));

const PasswordStrength = ({ password }) => {
  if (!password) return null;

  const passed = rules.filter((r) => r.test(password)).length;
  const pct = (passed / rules.length) * 100;

  const color =
    passed <= 1 ? 'bg-red-500' :
    passed <= 2 ? 'bg-orange-400' :
    passed <= 3 ? 'bg-yellow-400' :
    passed <= 4 ? 'bg-blue-400' :
                  'bg-green-500';

  const label =
    passed <= 1 ? 'Very weak' :
    passed <= 2 ? 'Weak' :
    passed <= 3 ? 'Fair' :
    passed <= 4 ? 'Good' :
                  'Strong';

  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`text-xs font-semibold ${
          passed <= 2 ? 'text-red-500' : passed <= 3 ? 'text-yellow-600' : 'text-green-600'
        }`}>{label}</span>
      </div>

      {/* Checklist */}
      <ul className="space-y-0.5">
        {rules.map((r) => {
          const ok = r.test(password);
          return (
            <li key={r.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${ok ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {ok ? '✓' : '·'}
              </span>
              {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordStrength;
