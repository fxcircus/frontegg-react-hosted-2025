import React, { useEffect } from 'react';
import { useAuthActions, useGroupsState } from '@frontegg/react';

const GroupsComponent = () => {
  const { loadGroups } = useAuthActions();
  const { groups } = useGroupsState();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        await loadGroups();
      } catch (error) {
        console.error("Error loading groups:", error);
      }
    };

    fetchGroups();
  }, [loadGroups]);

  return (
    <div>
      <h2>Groups List</h2>
      {groups && groups.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Group Name</th>
              <th>Group ID</th>
              <th>Role IDs</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id}>
                <td>{group.name}</td>
                <td>{group.id}</td>
                <td>
                  {group.roles && group.roles.length > 0
                    ? group.roles.map((role) => role.id).join(', ')
                    : 'No roles'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No groups available.</p>
      )}
    </div>
  );
};

export default GroupsComponent;
