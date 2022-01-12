import {
  ArweaveTransaction,
  Storefront,
  ArweaveQueryResponse,
} from '@oyster/common';
import { createClient } from 'redis';
import moment from 'moment';
import { maybeCDN } from '../utils/cdn';

const ARWEAVE_URL = process.env.NEXT_PUBLIC_ARWEAVE_URL;
const REDIS_URL = process.env.REDIS_URL;
const pubkeyDenyList = [
  'Fy8GCo5pyaMmUS6BqydzYnHBYeQN5BnKijCV2x2pRc3n',
  '9ztzyU9eFuce42CHD7opPxpjrsg15onjNARnmuMS2aQy',
  '5pKYHnoCMyjVqVdZaGAs63wUSBvhEGWnz5ie2YC5MaZx',
  'D2bj7rCLC4Dy9ZJuDNm5jFRNn5bqVTTpn16nnqDYmciv',
];

const fetchFromSource = async (
  subdomain: string,
): Promise<Storefront | null> => {
  try {
    const response = await fetch(`${ARWEAVE_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
            query GetStorefrontTheme($subdomain: String!) {
              transactions(tags:[{ name: "holaplex:metadata:subdomain", values: [$subdomain]}], first: 1) {
                edges {
                  node {
                    id
                    tags {
                      name
                      value
                    }
                  }
                }
              }
            }
          `,
        variables: {
          subdomain,
        },
      }),
    });

    const {
      data: {
        transactions: {
          edges: [{ node }],
        },
      },
    } = (await response.json()) as ArweaveQueryResponse;
    const transaction = node as ArweaveTransaction;

    const values = transaction.tags.reduce((acc: any, tag) => {
      acc[tag.name] = tag.value || null;

      return acc;
    }, {});
    if (pubkeyDenyList.includes(values['solana:pubkey'])) {
      return null;
    }

    const storefront = {
      subdomain,
      pubkey: values['solana:pubkey'],
      theme: {
        logo: maybeCDN(values['holaplex:theme:logo:url']),
        banner: maybeCDN(values['holaplex:theme:banner:url'] || ''),
        stylesheet: maybeCDN(`${ARWEAVE_URL}/${transaction.id}`),
        color: {
          background: values['holaplex:theme:color:background'],
          primary: values['holaplex:theme:color:primary'],
        },
        font: {
          title: values['holaplex:theme:font:title'],
          text: values['holaplex:theme:font:text'],
        },
      },
      meta: {
        favicon: maybeCDN(
          values['holaplex:metadata:favicon:url'] || '/favicon-16x16.png',
        ),
        title:
          values['holaplex:metadata:page:title'] ||
          `Holaplex - ${subdomain} | NFT Marketplace`,
        description:
          values['holaplex:metadata:page:description'] ||
          'A NFT marketplace generated by Holaplex',
      },
    };
    return storefront;
  } catch (err: any) {
    console.error(err);
    return null;
  }
};

export const getStorefront = async (
  subdomain: string,
): Promise<Storefront | undefined> => {
  let cached: Storefront | undefined = undefined;

  const client = createClient({
    url: REDIS_URL,
    socket: {
      tls: true,
      rejectUnauthorized: false,
    },
  });

  await client.connect();

  const [storefront, timestamp] = await Promise.all([
    client.get(subdomain),
    client.get(`${subdomain}-timestamp`),
  ]);

  if (storefront) {
    cached = JSON.parse(storefront);
  }

  const now = moment();
  const lastSavedAt = moment(timestamp);

  const duration = moment.duration(now.diff(lastSavedAt)).as('minutes');

  if (duration < 2 && cached) {
    await client.quit();
    return cached;
  }

  const source = await fetchFromSource(subdomain);

  if (source) {
    await client
      .multi()
      .set(subdomain, JSON.stringify(source))
      .set(`${subdomain}-timestamp`, now.format())
      .exec();

    await client.quit();
    return source;
  }

  await client.quit();

  return cached;
};
