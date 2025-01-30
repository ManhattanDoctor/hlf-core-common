import { ClassType, getUid, UID } from '@ts-core/common';
import { IUser } from './IUser';
import * as _ from 'lodash';

export class UserUtil {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static PREFIX = 'user';
    public static UID_REG_EXP = new RegExp(`^${UserUtil.PREFIX}_[0-9]{14}_[0-9a-fA-F]{64}$`);

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static create<T extends IUser>(classType: ClassType<T>, created: Date, hash: string): T {
        let item = new classType();
        item.uid = UserUtil.createUid(created, hash);
        item.created = created;
        return item;
    }

    public static createUid(created: Date, hash: string): string {
        return `${UserUtil.PREFIX}_${_.padStart(created.getTime().toString(), 14, '0')}_${hash}`;
    }

    public static isUser(uid: UID): boolean {
        return UserUtil.UID_REG_EXP.test(getUid(uid));
    }

    public static seed<T extends IUser>(classType: ClassType<T>, created?: Date, hash?: string): T {
        if (_.isNil(created)) {
            created = new Date(0);
        }
        if (_.isNil(hash)) {
            hash = _.padStart('0', 64, '0');
        }
        return UserUtil.create(classType, created, hash);
    }
}
