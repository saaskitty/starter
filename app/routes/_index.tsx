import { HeroSection } from "saaskitty/components/hero-section";
import { json } from "saaskitty/react-router";
import type { LoaderFunctionArgs } from "saaskitty/server";

export async function loader({ context: { app } }: LoaderFunctionArgs) {
	return json({});
}

export default function Component() {
	return (
		<div className="flex flex-col justify-center mx-auto max-w-[90%] min-h-dvh">
			<HeroSection />
		</div>
	);
}
