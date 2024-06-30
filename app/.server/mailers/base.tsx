import {
	AppMailer,
	type AppMailerOpts,
	Body,
	Container,
	Head,
	Html,
	Img,
	Preview,
	Section,
	Tailwind,
} from "saaskitty/mailer";
import type { AnyZodObject } from "saaskitty/validator";
import type { App } from "#app/.server/main.js";
import { theme } from "#tailwind.config.js";

export abstract class Base<Schema extends AnyZodObject> extends AppMailer<
	App,
	Schema
> {
	constructor(app: App) {
		super(app, {
			transport: app.config.PRIMARY_SMTP_URL,
		});
	}

	protected async template(opts: AppMailerOpts<Schema>) {
		const content = await this.content(opts);
		const preview = await this.preview(opts);

		return (
			<Html>
				<Head />
				<Preview>{preview}</Preview>

				<Tailwind config={{ theme }}>
					<Body className="bg-white my-auto mx-auto font-sans">
						<Container className="border-separate border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
							<Section className="mt-[32px]">
								<Img
									src={`${this.app.config.APP_BASE_URL}/assets/images/logo.png`}
									width="40"
									height="40"
									alt={this.app.config.APP_NAME}
									className="my-0 mx-auto"
								/>
							</Section>

							{content}
						</Container>
					</Body>
				</Tailwind>
			</Html>
		);
	}
}
