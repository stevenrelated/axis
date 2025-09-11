import { motion } from 'framer-motion';
import { BrandIcon, BrandLogo } from './icons';

export const AuthHeader = () => {
  // Responsive sizes: small on mobile, larger on md+
  // Tailwind's 'hidden' and 'block' utilities are used for conditional rendering
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex items-center justify-center gap-3 mb-8"
    >
      {/* BrandIcon: 24 on mobile, 32 on md+ */}
      <span className="text-current">
        <span className="block md:hidden">
          <BrandIcon size={40} />
        </span>
        <span className="hidden md:block">
          <BrandIcon size={64} />
        </span>
      </span>
      {/* BrandLogo: 56 on mobile, 80 on md+ */}
      <span className="pt-1">
        <span className="block md:hidden">
          <BrandLogo size={112} />
        </span>
        <span className="hidden md:block">
          <BrandLogo size={144} />
        </span>
      </span>
    </motion.div>
  );
};
