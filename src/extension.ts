import { ContainerBuilder } from "./builder";

export interface ExtensionInterface {
    configure(builder: ContainerBuilder): void ;
    getName(): string;
}