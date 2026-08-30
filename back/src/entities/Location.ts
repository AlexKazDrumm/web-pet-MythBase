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

@Entity({ name: "locations" })
@Index("IDX_locations_parent", ["parent"])
export class Location {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 128 })
  name!: string;

  @ManyToOne(() => Location, (location) => location.children, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "parent_id" })
  parent!: Location | null;

  @RelationId((location: Location) => location.parent)
  parentId!: number | null;

  @OneToMany(() => Location, (location) => location.parent)
  children!: Location[];
}
