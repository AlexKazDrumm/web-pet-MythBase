import {
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { Creature } from "./Creature";
import { Location } from "./Location";

@Entity({ name: "creature_locations" })
@Index("UQ_creature_location", ["creature", "location"], { unique: true })
export class CreatureLocation {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Creature, (creature) => creature.locationLinks, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "creature_id" })
  creature!: Creature;

  @RelationId((link: CreatureLocation) => link.creature)
  creatureId!: number;

  @ManyToOne(() => Location, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "location_id" })
  location!: Location;

  @RelationId((link: CreatureLocation) => link.location)
  locationId!: number;
}
