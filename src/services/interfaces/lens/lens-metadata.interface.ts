import { PublicationMainFocus } from '../../../infrastructure/config/enums/publication-main-focus.enum';
import { PublicationMetadataAttribute } from '../../../infrastructure/config/enums/publication-metadata-attributes.enum';
import { PublicationMetadataVersions } from '../../../infrastructure/config/enums/publication-metadata-version.enum';

export interface LensMetadata {
  /**
   * The metadata version.
   */
  version: PublicationMetadataVersions;

  /**
   * The metadata lens_id can be anything but if your uploading to ipfs
   * you will want it to be random.. using uuid could be an option!
   */
  metadata_id: string;

  /**
   * A human-readable description of the item.
   */
  description: string | undefined | null;

  /**
   * The content of a publication. If this is blank `media` must be defined or its out of spec.
   */
  content: string | undefined | null;

  /**
   * IOS 639-1 language code aka en or it and ISO 3166-1 alpha-2 region code aka US or IT aka en-US or it-IT
   * Full spec > https://tools.ietf.org/search/bcp47
   */
  locale: string;

  /**
   * Main content focus that for this publication
   */
  mainContentFocus: PublicationMainFocus;

  /**
   * Name of the item.
   */
  name: string;

  /**
   * These are the attributes for the item, which will show up on the OpenSea and others NFT trading websites on the item.
   */
  attributes: PublicationMetadataAttribute[];
}
