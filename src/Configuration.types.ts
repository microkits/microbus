import { Serializer } from "./serializer";
import { SerializerOptions } from "./serializer/SerializerFactory.types";
import { Transporter } from "./transporter";
import { TransporterOptions } from "./transporter/TransporterFactory.types";
import { TypeAndOptions } from "./types";

export type CreateTransporterOptions = string | Transporter | TypeAndOptions<TransporterOptions>;

export type CreateSerializerOptions = Serializer | TypeAndOptions<SerializerOptions>;