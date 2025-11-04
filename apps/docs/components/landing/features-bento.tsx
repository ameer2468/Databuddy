'use client';

import {
	ChartLineIcon,
	DeviceMobileIcon,
	GlobeIcon,
	LightningIcon,
	SparkleIcon,
	UsersIcon,
} from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { SciFiCard } from '@/components/scifi-card';
import { cn } from '@/lib/utils';

// Mini chart component for real-time analytics feature
const MiniChart = () => {
	const [data, setData] = useState([40, 45, 38, 50, 48, 55, 52]);

	useEffect(() => {
		const interval = setInterval(() => {
			setData((prev) => {
				const newData = [...prev.slice(1), Math.floor(Math.random() * 20) + 40];
				return newData;
			});
		}, 2000);

		return () => clearInterval(interval);
	}, []);

	const max = Math.max(...data);
	const min = Math.min(...data);
	const range = max - min || 1;

	return (
		<div className="flex h-20 items-end gap-1.5">
			{data.map((value, i) => {
				const height = ((value - min) / range) * 100;
				return (
					<motion.div
						animate={{ height: `${height}%` }}
						className="min-h-[20%] w-full rounded-sm bg-gradient-to-t from-primary to-primary/50"
						key={i}
						transition={{ duration: 0.5, ease: 'easeOut' }}
					/>
				);
			})}
		</div>
	);
};

// Animated metric card
const MetricCard = ({ delay = 0 }: { delay?: number }) => {
	const [value, setValue] = useState(1234);
	const [trend, setTrend] = useState(12.5);

	useEffect(() => {
		const interval = setInterval(() => {
			setValue((prev) => prev + Math.floor(Math.random() * 10));
			setTrend(Math.random() * 20 - 5);
		}, 3000);

		return () => clearInterval(interval);
	}, []);

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm"
			initial={{ opacity: 0, y: 20 }}
			transition={{ delay, duration: 0.5 }}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="rounded-md bg-primary/10 p-2">
						<UsersIcon className="h-4 w-4 text-primary" weight="duotone" />
					</div>
					<span className="text-muted-foreground text-xs">Visitors</span>
				</div>
				<motion.div
					animate={{ opacity: 1 }}
					className={cn(
						'flex items-center gap-1 text-xs',
						trend >= 0 ? 'text-green-500' : 'text-red-500'
					)}
					key={trend}
					initial={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					<span>{trend >= 0 ? '↑' : '↓'}</span>
					<span>{Math.abs(trend).toFixed(1)}%</span>
				</motion.div>
			</div>
			<motion.div
				animate={{ opacity: 1 }}
				className="mt-2 font-semibold text-2xl"
				key={value}
				initial={{ opacity: 0 }}
				transition={{ duration: 0.3 }}
			>
				{value.toLocaleString()}
			</motion.div>
		</motion.div>
	);
};

// Device icons animation
const DeviceAnimation = () => {
	const devices = [
		{ icon: DeviceMobileIcon, label: 'Mobile', percentage: 45 },
		{ icon: GlobeIcon, label: 'Desktop', percentage: 35 },
		{ icon: DeviceMobileIcon, label: 'Tablet', percentage: 20 },
	];

	return (
		<div className="space-y-3">
			{devices.map((device, i) => (
				<motion.div
					animate={{ opacity: 1, x: 0 }}
					className="flex items-center gap-3"
					initial={{ opacity: 0, x: -20 }}
					key={device.label}
					transition={{ delay: i * 0.2, duration: 0.5 }}
				>
					<device.icon className="h-5 w-5 text-primary" weight="duotone" />
					<div className="flex-1">
						<div className="flex items-center justify-between text-xs">
							<span className="text-foreground">{device.label}</span>
							<span className="text-muted-foreground">
								{device.percentage}%
							</span>
						</div>
						<div className="mt-1 h-2 overflow-hidden rounded-full bg-border/50">
							<motion.div
								animate={{ width: `${device.percentage}%` }}
								className="h-full bg-gradient-to-r from-primary to-primary/50"
								initial={{ width: '0%' }}
								transition={{ delay: i * 0.2 + 0.3, duration: 0.8 }}
							/>
						</div>
					</div>
				</motion.div>
			))}
		</div>
	);
};

// Events pulse animation
const EventsPulse = () => {
	const events = ['Button Click', 'Form Submit', 'Page View', 'Download'];
	const [activeEvent, setActiveEvent] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setActiveEvent((prev) => (prev + 1) % events.length);
		}, 2000);

		return () => clearInterval(interval);
	}, [events.length]);

	return (
		<div className="space-y-2">
			{events.map((event, i) => (
				<motion.div
					animate={{
						scale: activeEvent === i ? 1.02 : 1,
						borderColor:
							activeEvent === i ? 'rgb(var(--primary))' : 'transparent',
					}}
					className="flex items-center gap-2 rounded-md border border-transparent bg-card/50 p-2 backdrop-blur-sm transition-colors"
					key={event}
				>
					<motion.div
						animate={{
							scale: activeEvent === i ? [1, 1.2, 1] : 1,
							opacity: activeEvent === i ? [1, 0.5, 1] : 0.5,
						}}
						className="h-2 w-2 rounded-full bg-primary"
						transition={{ duration: 0.6 }}
					/>
					<span className="text-foreground text-xs">{event}</span>
					<span className="ml-auto text-muted-foreground text-xs">
						{Math.floor(Math.random() * 100)}
					</span>
				</motion.div>
			))}
		</div>
	);
};

// Traffic sources animation
const TrafficSources = () => {
	const sources = [
		{ name: 'Google', visitors: 2450, color: 'bg-blue-500' },
		{ name: 'Direct', visitors: 1840, color: 'bg-green-500' },
		{ name: 'Social', visitors: 980, color: 'bg-purple-500' },
	];

	const total = sources.reduce((acc, s) => acc + s.visitors, 0);

	return (
		<div className="space-y-2">
			{sources.map((source, i) => {
				const percentage = (source.visitors / total) * 100;
				return (
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="space-y-1"
						initial={{ opacity: 0, y: 10 }}
						key={source.name}
						transition={{ delay: i * 0.15, duration: 0.4 }}
					>
						<div className="flex items-center justify-between text-xs">
							<div className="flex items-center gap-2">
								<div className={cn('h-2 w-2 rounded-full', source.color)} />
								<span className="text-foreground">{source.name}</span>
							</div>
							<span className="text-muted-foreground">
								{source.visitors.toLocaleString()}
							</span>
						</div>
						<div className="h-1.5 overflow-hidden rounded-full bg-border/50">
							<motion.div
								animate={{ width: `${percentage}%` }}
								className={cn('h-full', source.color)}
								initial={{ width: '0%' }}
								transition={{ delay: i * 0.15 + 0.2, duration: 0.6 }}
							/>
						</div>
					</motion.div>
				);
			})}
		</div>
	);
};

// Feature cards data
const features = [
	{
		id: 'realtime',
		title: 'Real-time Analytics',
		description: 'Watch your data update live as users interact with your site',
		icon: ChartLineIcon,
		animation: MiniChart,
		size: 'large' as const,
	},
	{
		id: 'metrics',
		title: 'Smart Metrics',
		description: 'Track key performance indicators with trend analysis',
		icon: SparkleIcon,
		animation: MetricCard,
		size: 'medium' as const,
	},
	{
		id: 'devices',
		title: 'Device Analytics',
		description: 'Understand how users access your content',
		icon: DeviceMobileIcon,
		animation: DeviceAnimation,
		size: 'medium' as const,
	},
	{
		id: 'events',
		title: 'Custom Events',
		description: 'Track user interactions and custom actions',
		icon: LightningIcon,
		animation: EventsPulse,
		size: 'medium' as const,
	},
	{
		id: 'traffic',
		title: 'Traffic Sources',
		description: 'Discover where your visitors come from',
		icon: GlobeIcon,
		animation: TrafficSources,
		size: 'medium' as const,
	},
];

export const FeaturesBento = () => {
	return (
		<div className="w-full">
			{/* Header Section */}
			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="mb-12 text-center lg:mb-16"
				initial={{ opacity: 0, y: 20 }}
				transition={{ duration: 0.6 }}
			>
				<h2 className="mx-auto max-w-4xl font-semibold text-3xl leading-tight sm:text-4xl lg:text-5xl">
					<span className="text-muted-foreground">Powerful features, </span>
					<span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
						beautifully simple
					</span>
				</h2>
				<p className="mt-3 max-w-2xl text-muted-foreground text-sm sm:px-0 sm:text-base lg:text-lg mx-auto">
					Everything you need to understand your users, all in one place.
				</p>
			</motion.div>

			{/* Bento Grid */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
				{/* Large feature - spans 2 columns on desktop */}
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className="lg:col-span-2"
					initial={{ opacity: 0, y: 20 }}
					transition={{ delay: 0.1, duration: 0.6 }}
				>
					<FeatureCard feature={features[0]} />
				</motion.div>

				{/* Medium feature */}
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					initial={{ opacity: 0, y: 20 }}
					transition={{ delay: 0.2, duration: 0.6 }}
				>
					<FeatureCard feature={features[1]} />
				</motion.div>

				{/* Medium feature */}
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					initial={{ opacity: 0, y: 20 }}
					transition={{ delay: 0.3, duration: 0.6 }}
				>
					<FeatureCard feature={features[2]} />
				</motion.div>

				{/* Medium feature */}
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					initial={{ opacity: 0, y: 20 }}
					transition={{ delay: 0.4, duration: 0.6 }}
				>
					<FeatureCard feature={features[3]} />
				</motion.div>

				{/* Medium feature */}
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					initial={{ opacity: 0, y: 20 }}
					transition={{ delay: 0.5, duration: 0.6 }}
				>
					<FeatureCard feature={features[4]} />
				</motion.div>
			</div>
		</div>
	);
};

// Feature card component
interface Feature {
	id: string;
	title: string;
	description: string;
	icon: React.ComponentType<any>;
	animation: React.ComponentType<any>;
	size: 'large' | 'medium';
}

const FeatureCard = ({ feature }: { feature: Feature }) => {
	const Icon = feature.icon;
	const Animation = feature.animation;

	return (
		<SciFiCard
			className={cn(
				'group h-full overflow-hidden border border-border bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/50',
				feature.size === 'large' ? 'min-h-[400px]' : 'min-h-[320px]'
			)}
		>
			<div className="flex h-full flex-col p-6 lg:p-8">
				{/* Header */}
				<div className="mb-6">
					<div className="mb-4 inline-flex rounded-lg border border-border/50 bg-background/50 p-3">
						<Icon
							className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110"
							weight="duotone"
						/>
					</div>
					<h3 className="mb-2 font-semibold text-foreground text-xl transition-colors duration-300 group-hover:text-primary">
						{feature.title}
					</h3>
					<p className="text-muted-foreground text-sm leading-relaxed">
						{feature.description}
					</p>
				</div>

				{/* Animation Section */}
				<div className="mt-auto">
					<Animation />
				</div>
			</div>
		</SciFiCard>
	);
};
