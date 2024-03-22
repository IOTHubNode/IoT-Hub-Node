import { newEnforcer } from 'casbin';
import { PrismaAdapter } from 'casbin-prisma-adapter';

async function test() {
  const a = await PrismaAdapter.newAdapter();
  const e = await newEnforcer('src/tests/model.conf', a);

  const sub = 'alice'; // the user that wants to access a resource.
  const obj = 'data1'; // the resource that is going to be accessed.
  const act = 'read'; // the operation that the user performs on the resource.
  await e.addPolicy('p', 'alice', 'data1', 'read');
  await e.addPolicy('p', 'bob', 'data2', 'write');
  await e.addPolicy('p', 'data2_admin', 'data2', 'read');
  await e.addPolicy('p', 'data2_admin', 'data2', 'write');
  await e.addGroupingPolicy('alice', 'data2_admin');
  if ((await e.enforce(sub, obj, act)) === true) {
    // permit alice to read data1
    console.log(true);
  } else {
    console.log(false);
    // deny the request, show an error
  }

  const roles = await e.getRolesForUser('alice');
  console.log(roles);
}

test();
