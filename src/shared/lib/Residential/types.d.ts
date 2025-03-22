import { Currency } from "shared/lib/Residential/Currency";

export type Price = {
	value: number;
	currency: Currency;
};

export interface IStructure {
	id: string;

	name: string;
	description: string;
	model: Model;

	price: Price;
}

export interface IStructureCategory {
	id: string;
	icon: RbxAssetId;

	verboseName: string;
	verboseNamePlural: string;
	description: string;

	structures: Array<IStructure>;

	getStructureById(id: string): IStructure | undefined;
	getStructureByName(name: string): IStructure | undefined;
	getStructuresWithinPrice(price: number): IStructure[];
	getSearchResults(query: string): IStructure[];
}

export interface IStructureInstance {
	// a unique identifier
	uuid: string;
	structure: IStructure;
	model?: Model;

	spawn(): Model;
	destroy(): void;
}
