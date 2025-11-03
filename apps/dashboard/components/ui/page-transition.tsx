'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
	children: ReactNode;
	className?: string;
}

const pageVariants = {
	initial: {
		opacity: 0,
		y: 10,
	},
	animate: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.4,
			ease: [0.16, 1, 0.3, 1], // expo-out easing
		},
	},
	exit: {
		opacity: 0,
		y: -10,
		transition: {
			duration: 0.3,
			ease: [0.7, 0, 0.84, 0], // expo-in easing
		},
	},
};

export function PageTransition({ children, className }: PageTransitionProps) {
	return (
		<motion.div
			animate="animate"
			className={className}
			exit="exit"
			initial="initial"
			variants={pageVariants}
		>
			{children}
		</motion.div>
	);
}
