import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { AltCreatureName } from "./AltCreatureName";
import { CreatureLocation } from "./CreatureLocation";
import { NativeCreatureName } from "./NativeCreatureName";
import { TypeEntity } from "./TypeEntity";

@Entity({ name: "creatures" })
@Index("IDX_creatures_type", ["type"])
export class Creature {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 128 })
  name!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "varchar", length: 256, name: "cover_link" })
  coverLink!: string;

  @ManyToOne(() => TypeEntity, { eager: true, onDelete: "RESTRICT", nullable: false })
  @JoinColumn({ name: "type_id" })
  type!: TypeEntity;

  @RelationId((creature: Creature) => creature.type)
  typeId!: number;

  @OneToMany(() => CreatureLocation, (link) => link.creature)
  locationLinks!: CreatureLocation[];

  @OneToMany(() => AltCreatureName, (alt) => alt.creature)
  altNames!: AltCreatureName[];

  @OneToMany(() => NativeCreatureName, (native) => native.creature)
  nativeNames!: NativeCreatureName[];
}
