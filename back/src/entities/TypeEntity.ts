import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "types" })
export class TypeEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 64, unique: true })
  name!: string;
}
