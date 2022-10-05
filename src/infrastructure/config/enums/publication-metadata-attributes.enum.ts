import { PublicationMetadataDisplayType } from './publication-metadata-display-type.enum';

export interface PublicationMetadataAttribute {
  displayType?: PublicationMetadataDisplayType;
  traitType?: string;
  value: string;
}
