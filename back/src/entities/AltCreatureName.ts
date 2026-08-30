import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { Creature } from "./Creature";

@Entity({ name: "alt_creature_names" })
export class AltCreatureName {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Creature, (creature) => creature.altNames, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "creature_id" })
  creature!: Creature;

  @RelationId((alt: AltCreatureName) => alt.creature)
  creatureId!: number;

  @Column({ type: "varchar", length: 128 })
  name!: string;
}
