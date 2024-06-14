import { Flex } from 'antd';
import { Breadcrumbs, BreadcrumbItem } from '@nextui-org/react';

import { SybilBalance } from 'Shared/SybilBalance';
import { BREAK_POINT_MOBILE } from 'Constants/ui';
import useWindowDimensions from 'Utils/useWindowDimensions';
import { AuthorizedActions } from 'Shared/AuthorizedActions';
import ROUTES from 'Constants/routes';

import { SybilTopUp } from 'Shared/SybilTopUp';
import { KeysTable } from './KeysTable';
import { DomainsTable } from './DomainsTable';
import { Example } from './Example';

export const APIKeys = () => {
  const { width } = useWindowDimensions();
  const isMobile = width <= BREAK_POINT_MOBILE;

  return (
    <div>
      <div className={`flex justify-between ${isMobile ? 'flex-col' : ''}`}>
        <div className="flex flex-col">
          <Breadcrumbs radius="full" variant="solid" className="mb-2">
            <BreadcrumbItem href={ROUTES.SYBIL}>Sybil</BreadcrumbItem>
            <BreadcrumbItem>API Keys</BreadcrumbItem>
          </Breadcrumbs>
          <h3 className="text-xl font-bold">API Keys</h3>
        </div>

        <Flex align="center" justify="space-between" gap={8} vertical={isMobile}>
          <SybilBalance/>

          <AuthorizedActions>
            <SybilTopUp/>
          </AuthorizedActions>
        </Flex>
      </div>

      <div className="flex justify-center mb-5">
        <Example />
      </div>

      <div className="my-5">
        <KeysTable />
      </div>

      <div className="my-5">
        <DomainsTable />
      </div>
    </div>
  );
};
