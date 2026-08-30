import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { Creature } from "./Creature";

@Entity({ name: "native_creature_names" })
export class NativeCreatureName {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Creature, (creature) => creature.nativeNames, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "creature_id" })
  creature!: Creature;

  @RelationId((native: NativeCreatureName) => native.creature)
  creatureId!: number;

  @Column({ type: "varchar", length: 128 })
  name!: string;
}
