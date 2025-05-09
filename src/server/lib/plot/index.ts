import { Assert } from "@rbxts/lunit";
import { LinkedList } from "shared/lib/data-structures/linked-list";
import { PLATFORM_INSTANCE_NAME, PLOT_STRUCTURES_FOLDER_NAME } from "shared/lib/plot/configs";
import { hitboxIsCollidedInPlot } from "shared/lib/plot/utils/plot-collisions";
import { IStructureInstance, SerializedStructureInstance } from "shared/lib/residential/types";
import { getAllCharacters } from "shared/util/character-utils";

export type SerializedPlotInstance = {
	structures: SerializedStructureInstance[];
};

/**
 * Represents a plot of land in the game. Manages player assignments, structures, and plot state.
 */
export default class Plot {
	private player?: Player;
	private instance: PlotInstance;
	private structureList: LinkedList<string, IStructureInstance>;

	/**
	 * Creates a new `Plot` instance.
	 * @param plotInstance - The instance of the plot in the game world.
	 */
	constructor(plotInstance: PlotInstance) {
		this.player = undefined;
		this.instance = plotInstance;
		this.structureList = new LinkedList<string, IStructureInstance>();
	}

	/**
	 * Assigns a player to the plot.
	 * Ensures that the plot is not already assigned to another player.
	 * @param player - The player to assign to the plot.
	 * @throws Will throw an error if the plot is already assigned to another player.
	 */
	public assignPlayer(player: Player): void {
		Assert.undefined(
			this.player,
			() => `[Plot]: Player ${player.Name} cannot be assigned because plot is already assigned`,
		);

		this.player = player;
	}

	/**
	 * Retrieves the player currently assigned to the plot.
	 * @returns The assigned player, or `undefined` if no player is assigned.
	 */
	public getPlayer(): Optional<Player> {
		return this.player;
	}

	/**
	 * Retrieves the `PlotInstance` associated with this plot.
	 * @returns The `PlotInstance` object.
	 */
	public getInstance(): PlotInstance {
		return this.instance;
	}

	/**
	 * Checks if the plot is currently assigned to a player.
	 * @returns `true` if the plot is assigned, otherwise `false`.
	 */
	public isAssigned(): boolean {
		return this.player !== undefined;
	}

	/**
	 * Unassigns the player from the plot.
	 * Ensures that all structures are destroyed and verifies that no objects are left in the plot's structure folder.
	 */
	public unassignPlayer(): void {
		if (this.player === undefined) {
			return;
		}

		this.clear();
	}

	/**
	 * Adds a structure to the plot at the specified position.
	 * @param structureInstance - The structure to add.
	 * @param cframe - The position and orientation where the structure should be placed.
	 * @throws Will throw an error if the structure's model does not have a `PrimaryPart`.
	 */
	public addStructure(
		structureInstance: IStructureInstance,
		cframe: CFrame,
		positionRelativeToPlatform: boolean = false,
	): void {
		// First, determine if there will be any collision issues
		// Clone a hitbox
		const tempHitbox = structureInstance.structure.model.PrimaryPart;
		if (tempHitbox === undefined) {
			throw `[Plot]: Primary part of structure model with ID ${structureInstance.structure.id} does not have a Primary Part`;
		}
		const isCollided = hitboxIsCollidedInPlot(tempHitbox, this.instance, getAllCharacters());
		if (isCollided === true) {
			throw `[Plot]: Attempted to place new model for Player "${this.player?.Name}", but it collided unexpectedly`;
		}

		// spawn a model
		const newStructure = structureInstance.spawn(this.instance[PLOT_STRUCTURES_FOLDER_NAME]);

		if (newStructure.PrimaryPart === undefined) {
			throw `[Plot]: Primary part of structure model with ID ${structureInstance.structure.id} does not have a Primary Part`;
		}

		newStructure.PrimaryPart.Anchored = true;
		newStructure.PrimaryPart.CanCollide = false;

		if (positionRelativeToPlatform === true) {
			const platform = this.getPlatform();

			if (platform !== undefined) {
				cframe = platform.CFrame.mul(cframe);
			} else {
				throw `[Plot:addStructure]: Platform is undefined`;
			}
		}

		newStructure.PivotTo(cframe);

		this.structureList.add(structureInstance.uuid, structureInstance);
	}

	public clear(): void {
		this.structureList.forEach((_, value) => {
			value.destroy();
		});

		Assert.empty(
			this.instance[PLOT_STRUCTURES_FOLDER_NAME].GetChildren(),
			() => `[Plot]: Object leak detected while unassigning player ${this.player?.Name}`,
		);
	}

	/**
	 * Serializes the plot's data, including all structures, into an object.
	 * @returns An object containing serialized data for the plot.
	 */
	public serialize(): SerializedPlotInstance {
		const platform = this.instance.FindFirstChild(PLATFORM_INSTANCE_NAME) as BasePart | undefined;
		const platformCFrame = platform?.CFrame;

		return {
			structures: this.structureList.map((_, structure) => structure.serialize(platformCFrame)),
		};
	}

	public static getEmptySerializedPlotInstance(): SerializedPlotInstance {
		return {
			structures: [],
		};
	}

	private getPlatform(): BasePart | undefined {
		return this.instance.FindFirstChild(PLATFORM_INSTANCE_NAME) as BasePart | undefined;
	}
}
