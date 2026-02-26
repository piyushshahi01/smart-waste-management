import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 40,
        scale: 0.98
    },
    in: {
        opacity: 1,
        y: 0,
        scale: 1
    },
    out: {
        opacity: 0,
        y: -40,
        scale: 0.98
    },
};

const pageTransition = {
    duration: 0.8,
    ease: [0.16, 1, 0.3, 1]
};

export default function AnimatedPage({ children, className = "" }) {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className={`h-full ${className}`}
        >
            {children}
        </motion.div>
    );
}
