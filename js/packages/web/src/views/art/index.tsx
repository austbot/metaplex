import {
  loadArtwork,
  shortenAddress,
  useConnection,
  useMeta,
} from '@oyster/common';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button, Col, Divider, List, Row, Skeleton, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sendSignMetadata } from '../../actions/sendSignMetadata';
import { ArtContent } from '../../components/ArtContent';
import { ArtMinting } from '../../components/ArtMinting';
import { MetaAvatar } from '../../components/MetaAvatar';
import { ViewOn } from '../../components/ViewOn';
import { useArt, useExtendedArt } from '../../hooks';
import { ArtType } from '../../types';

export const ArtView = () => {
  const { id } = useParams<{ id: string }>();
  const wallet = useWallet();
  const { patchState, whitelistedCreatorsByCreator } = useMeta();
  const [remountArtMinting, setRemountArtMinting] = useState(0);

  const connection = useConnection();
  const art = useArt(id);

  let badge = '';
  let maxSupply = '';
  if (art.type === ArtType.NFT) {
    badge = 'Unique';
  } else if (art.type === ArtType.Master) {
    badge = 'NFT 0';
    if (art.maxSupply !== undefined) {
      maxSupply = art.maxSupply.toString();
    } else {
      maxSupply = 'Unlimited';
    }
  } else if (art.type === ArtType.Print) {
    badge = `${art.edition} of ${art.supply}`;
  }
  const { ref, data } = useExtendedArt(id);

  useEffect(() => {
    (async () => {
      const artState = await loadArtwork(
        connection,
        whitelistedCreatorsByCreator,
        id,
      );

      patchState(artState);
    })();
  }, [connection]);

  const description = data?.description;
  const attributes = data?.attributes;

  const pubkey = wallet?.publicKey?.toBase58() || '';

  const tag = (
    <div>
      <Tag color="blue">UNVERIFIED</Tag>
    </div>
  );

  const unverified = (
    <>
      {tag}
      <div>
        <i>
          This artwork is still missing verification from{' '}
          {art.creators?.filter(c => !c.verified).length} contributors before it
          can be considered verified and sellable on the platform.
        </i>
      </div>
      <br />
    </>
  );

  return (
    <Row ref={ref} gutter={32}>
      <Col xs={{ span: 24 }} md={{ span: 12 }}>
        <ArtContent
          height={300}
          width={300}
          pubkey={id}
          active={true}
          allowMeshRender={true}
          artView={true}
        />
      </Col>
      {/* <Divider /> */}
      <Col xs={{ span: 24 }} md={{ span: 12 }}>
        <Space direction="vertical" className="metaplex-fullwidth">
          <h1>{art.title || <Skeleton paragraph={{ rows: 0 }} />}</h1>
          <Row>
            <Col span={6}>
              <h6>Royalties</h6>
              <div>
                {((art.seller_fee_basis_points || 0) / 100).toFixed(2)}%
              </div>
            </Col>
            <Col span={12}>
              <ViewOn id={id} />
            </Col>
          </Row>
          <Space direction="vertical">
            {(art.creators || []).map((creator, idx) => {
              return (
                <Space direction="horizontal" key={idx}>
                  <MetaAvatar creators={[creator]} size={64} />
                  <div>
                    <span>
                      {creator.name || shortenAddress(creator.address || '')}
                    </span>
                    <div>
                      {!creator.verified &&
                        (creator.address === pubkey ? (
                          <Button
                            onClick={async () => {
                              try {
                                await sendSignMetadata(connection, wallet, id);
                              } catch (e) {
                                console.error(e);
                                return false;
                              }
                              return true;
                            }}
                          >
                            Approve
                          </Button>
                        ) : (
                          tag
                        ))}
                    </div>
                  </div>
                </Space>
              );
            })}
          </Space>
          <div>
            <h6>Edition</h6>
            <div>{badge}</div>
          </div>
          {art.type === ArtType.Master && (
            <div>
              <h6>Max Supply</h6>
              <div>{maxSupply}</div>
            </div>
          )}
          {/* <Button
                  onClick={async () => {
                    if(!art.mint) {
                      return;
                    }
                    const mint = new PublicKey(art.mint);

                    const account = accountByMint.get(art.mint);
                    if(!account) {
                      return;
                    }

                    const owner = wallet.publicKey;

                    if(!owner) {
                      return;
                    }
                    const instructions: any[] = [];
                    await updateMetadata(undefined, undefined, true, mint, owner, instructions)

                    sendTransaction(connection, wallet, instructions, [], true);
                  }}
                >
                  Mark as Sold
                </Button> */}

          {/* TODO: Add conversion of MasterEditionV1 to MasterEditionV2 */}
          <ArtMinting
            id={id}
            key={remountArtMinting}
            onMint={async () => await setRemountArtMinting(prev => prev + 1)}
          />
        </Space>
      </Col>
      <Col span="12">
        <Divider />
        {art.creators?.find(c => !c.verified) && unverified}
        <br />
        <div>ABOUT THE CREATION</div>
        <div>{description}</div>
        <br />
        {/*
              TODO: add info about artist
            <div>ABOUT THE CREATOR</div>
            <div>{art.about}</div> */}
      </Col>
      <Col span="12">
        {attributes && (
          <>
            <Divider />
            <br />
            <div>Attributes</div>
            <List size="large" grid={{ column: 4 }}>
              {attributes.map(attribute => (
                <List.Item key={attribute.display_type}>
                  <List.Item.Meta
                    title={attribute.trait_type}
                    description={attribute.value}
                  />
                </List.Item>
              ))}
            </List>
          </>
        )}
      </Col>
    </Row>
  );
};
