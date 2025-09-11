import { motion } from 'framer-motion';
import { BrandIcon, BrandLogo } from './icons';

export const Greeting = () => {
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto mt-4 md:mt-16 px-4 md:px-0 size-full flex flex-col justify-center items-center text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-2 text-3xl md:text-7xl font-medium"
      >
        <span className="text-current">
          {/* 40 on mobile, 64 on desktop */}
          <span className="block md:hidden">
            <BrandIcon size={40} />
          </span>
          <span className="hidden md:block">
            <BrandIcon size={64} />
          </span>
        </span>
        <span className="pt-1">
          {/* 80 on mobile, 144 on desktop */}
          <span className="block md:hidden">
            <BrandLogo size={112} />
          </span>
          <span className="hidden md:block">
            <BrandLogo size={144} />
          </span>
        </span>
      </motion.div>
    </div>
  );
};
