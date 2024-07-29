import { ClassType, getUid, UID } from '@ts-core/common';
import { IUser } from './User';
import * as _ from 'lodash';

export class UserUtil {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static PREFIX = 'user';
    public static UID_REG_EXP = new RegExp(`^${UserUtil.PREFIX}/[0-9]{14}/[0-9a-fA-F]{64}$`);
    public static MAX_CREATED_DATE = new Date(2500, 0);

    // --------------------------------------------------------------------------
    //
    //  Static Methods
    //
    // --------------------------------------------------------------------------

    public static create<T extends IUser>(classType: ClassType<T>, createdDate: Date, transactionHash: string): T {
        let item = new classType();
        item.uid = UserUtil.createUid(createdDate, transactionHash);
        item.createdDate = createdDate;
        return item;
    }

    public static createUid(createdDate: Date, transactionHash: string): string {
        let time = UserUtil.MAX_CREATED_DATE.getTime() - createdDate.getTime();
        return `${UserUtil.PREFIX}/${_.padStart(time.toString(), 14, '0')}/${transactionHash}`;
    }

    public static createRoot<T extends IUser>(classType: ClassType<T>): T {
        return UserUtil.create(classType, new Date(2000, 0), _.padStart('0', 64, '0'));
    }

    public static IsUser(uid: UID): boolean {
        return UserUtil.UID_REG_EXP.test(getUid(uid));
    }
}