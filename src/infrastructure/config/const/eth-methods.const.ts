/* eslint-disable max-len */
export class ETHMethods {
  public static readonly TRANSFER_HEX = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

  public static readonly TRANSFER_HUMAN = 'Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId)';

  public static readonly SINGLE_HEX = '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62';

  public static readonly SINGLE_HUMAN = 'TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value)';

  public static readonly TRANSFER_METHODS = [ETHMethods.TRANSFER_HEX, ETHMethods.SINGLE_HEX];

  public static readonly BYTES_PER_METHOD_DATA = 64;

  public static readonly EXTRA_BITS_PER_METHOD_ADDRESS = '0x000000000000000000000000';
}
