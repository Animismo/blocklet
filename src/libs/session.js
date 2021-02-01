/* eslint-disable object-curly-newline */
import { createAuthServiceSessionContext } from '@arcblock/did-react/lib/Session';

const { SessionProvider, SessionContext, SessionConsumer, withSession } = createAuthServiceSessionContext();
export { SessionProvider, SessionContext, SessionConsumer, withSession };
