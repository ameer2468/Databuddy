import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			className={cn('skeleton rounded-md bg-muted/50', className)}
			data-slot="skeleton"
			{...props}
		/>
	);
}

export { Skeleton };
