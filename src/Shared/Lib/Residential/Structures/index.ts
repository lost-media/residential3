import { IStructureCategory } from "../types";
import RoadCategory from "./Categories/Road";
import ResidentialCategory from "./Categories/Residential";
import { LinkedList, ReadonlyILinkedList } from "shared/lib/DataStructures/LinkedList";

export const StructureCategories: ReadonlyILinkedList<string, IStructureCategory> = LinkedList.fromArray([
	[RoadCategory.id, RoadCategory],
	[ResidentialCategory.id, ResidentialCategory],
]);
