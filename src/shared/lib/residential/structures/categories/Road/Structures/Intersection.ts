import { MODELS_FOLDER } from "shared/lib/residential/configs";
import { Koins } from "shared/lib/residential/currency";
import { IStructure } from "shared/lib/residential/types";

const structure: IStructure = {
	id: "road-intersection",

	name: "Intersection",
	description: "An intersection.",
	model: MODELS_FOLDER?.Road.FindFirstChild("NormalRoad") as Model,

	price: {
		value: 100,
		currency: Koins,
	},
};

export = structure;
