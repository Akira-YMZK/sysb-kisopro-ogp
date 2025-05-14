import { LocationData } from '../../types';
import { getLocatonNavigation } from '../utils/data-utils';

export async function findPath(startId: string, goalId: string): Promise<string> {
    let locationNavigation = new Map((await getLocatonNavigation()).map(v=>[v.location,v]));
    const Q = [{ id: goalId, cost: 0, path: -1 }];
    const known = new Set();
    while(Q.length > 0) {
        const q = Q.shift();
        if(q.id == startId) return q.path;
        known.add(q.id);
        const lcNav = locationNavigation.get(q.id);
        lcNav.connections.forEach(conn=>{
            const target = conn.target_location;
            if(known.has(target)) return;
            const newCost = q.cost+conn.distance_meters;
            const oldIndex = Q.findIndex(elm=>elm.id==target);
            if(oldIndex != -1) {
                if(Q[oldIndex].cost < newCost) {
                    return;
                } else {
                    Q.splice(oldndex, 1);
                }
            }
            const newQ = { id: target, cost: newCost, path: q.id };
            if(Q.at(-1) < newCost) Q.push(newQ);
            else {
                const newIndex = Q.findIndex(elm=>elm.cost>=newCost);
                Q.splice(newIndex, 0, newQ);
            }
        });
    }
}
