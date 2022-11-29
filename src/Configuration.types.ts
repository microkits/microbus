import { Transporter } from "./transporter";
import { TransporterOptions } from "./transporter/TransporterFactory.types";
import { TypeAndOptions } from "./types";

export type CreateTransporterOptions = string | Transporter | TypeAndOptions<TransporterOptions>;