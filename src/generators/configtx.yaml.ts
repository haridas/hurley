import { BaseGenerator } from './base';
import { join } from 'path';

export class ConfigTxYamlGeneratorOptions {
  orgs: string[];
  channels: number;
}
export class ConfigTxYamlGenerator extends BaseGenerator {
  contents = `---
Organizations:
  - &OrdererOrg
    Name: OrdererOrg
    ID: OrdererMSP
    MSPDir: ./artifacts/crypto-config/ordererOrganizations/hurley.lab/msp
   

${this.options.orgs.map(x =>` 
  - &${x}
    Name: ${x}MSP
    ID: ${x}MSP
    MSPDir: ./artifacts/crypto-config/peerOrganizations/${x}.hurley.lab/msp
    AnchorPeers:
      - Host: peer0.${x}.hurley.lab
        Port: 7051

`).join('')}


Capabilities:
  Channel: &ChannelCapabilities
    V1_3: true
  Orderer: &OrdererCapabilities
    V1_1: true
  Application: &ApplicationCapabilities
    V1_3: true
    V1_2: false
    V1_1: false

Application: &ApplicationDefaults
  Organizations:


  Capabilities:
    <<: *ApplicationCapabilities

Orderer: &OrdererDefaults
  OrdererType: solo

  Addresses:
    - orderer.hurley.lab:7050

  BatchTimeout: 2s

  BatchSize:
    MaxMessageCount: 10
    AbsoluteMaxBytes: 99 MB
    PreferredMaxBytes: 512 KB

  Organizations:
 

Channel: &ChannelDefaults
  Capabilities:
      <<: *ChannelCapabilities


Profiles:
  OrgsOrdererGenesis:
    Orderer:
      <<: *OrdererDefaults
      Organizations:
        - *OrdererOrg
      Capabilities:
        <<: *OrdererCapabilities
    Consortiums:
      SampleConsortium:
        Organizations:
          ${this.options.orgs.map(x => `- *${x}
          `).join('')}
  OrgsChannel:
    Consortium: SampleConsortium
    <<: *ChannelDefaults
    Application:
      <<: *ApplicationDefaults
      Capabilities:
        <<: *ApplicationCapabilities
      Organizations:
        ${this.options.orgs.map(x => `- *${x}
        `).join('')}
    `;

  constructor(filename: string, path: string, private options: ConfigTxYamlGeneratorOptions) {
    super(filename, path);

    this.success = join(path, 'configtx.yaml.successful');
  }
}